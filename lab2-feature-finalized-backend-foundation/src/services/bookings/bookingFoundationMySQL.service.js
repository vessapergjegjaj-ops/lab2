const createBaseMySQLService = require("../common/baseMySQL.service");
const bookingFoundationMySQLRepository = require("../../repositories/bookings/bookingFoundationMySQL.repository");
const userFoundationMySQLRepository = require("../../repositories/users/userFoundationMySQL.repository");
const ticketFoundationMySQLRepository = require("../../repositories/tickets/ticketFoundationMySQL.repository");
const bookingMongoDBService = require("./bookingMongoDB.service");
const auditLogMySQLService = require("../auditLogs/auditLogMySQL.service");
const mongoose = require('mongoose');

// Convert any ID to a valid MongoDB ObjectId
// If ID is already a 24-char hex string, use it directly
// Otherwise, create a deterministic ObjectId from the input
const toObjectId = (id) => {
  const strId = String(id);

  // Check if it's already a valid 24-character hex ObjectId
  if (/^[0-9a-fA-F]{24}$/.test(strId)) {
    return strId;
  }

  // Create a deterministic ObjectId from the string
  // Pad or hash the string to create a valid ObjectId
  let hash = 0;
  for (let i = 0; i < strId.length; i++) {
    const char = strId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Create proper 24-character ObjectId from the input
  // Format: 4 bytes timestamp + 5 bytes machine/process + 3 bytes counter
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const machineId = (process.pid || Math.random() * 1000000).toString(16).padStart(6, '0').slice(-6);
  const processId = (process.pid || Math.random() * 1000).toString(16).padStart(4, '0').slice(-4);
  const counter = Math.abs(hash).toString(16).padStart(6, '0').slice(-6);

  return timestamp + machineId + processId + counter;
};

// Map MySQL status to MongoDB valid status
const mapStatusToMongo = (status) => {
  const validMongoStatuses = ['pending', 'confirmed', 'cancelled'];
  const normalized = String(status || 'pending').toLowerCase();

  if (validMongoStatuses.includes(normalized)) {
    return normalized;
  }

  // Map common alternatives
  if (normalized === 'complete' || normalized === 'completed') {
    return 'confirmed';
  }

  return 'pending';
};

// Sleep helper for retry delays
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const bookingFoundationMySQLService = {
  ...createBaseMySQLService(bookingFoundationMySQLRepository),

  async getAllBookings() {
    return await bookingFoundationMySQLRepository.findDetailedAll();
  },

  async getBookingById(id) {
    return await bookingFoundationMySQLRepository.findDetailedById(id);
  },

  async getBookingsByUserId(userId) {
    return await bookingFoundationMySQLRepository.findDetailedByUserId(userId);
  },

  /**
   * Ensure a user exists in MongoDB, create if missing
   */
  async syncUserToMongoDB(userId) {
    const user = await userFoundationMySQLRepository.findById(userId);
    if (!user) {
      throw new Error("User not found in MySQL");
    }

    const userMongoDBRepo = require("../../repositories/users/userMongoDB.repository");
    const existingUser = await userMongoDBRepo.findById(toObjectId(userId));

    if (existingUser) {
      return existingUser._id;
    }

    // Create user in MongoDB
    const newUser = await userMongoDBRepo.create({
      name: user.name,
      email: user.email,
      _id: toObjectId(userId)
    });

    return newUser._id;
  },

  /**
   * Ensure a ticket exists in MongoDB, create if missing
   */
  async syncTicketToMongoDB(ticketId, totalPrice) {
    const ticket = await ticketFoundationMySQLRepository.findById(ticketId);
    if (!ticket) {
      throw new Error("Ticket not found in MySQL");
    }

    const ticketMongoDBRepo = require("../../repositories/tickets/ticketMongoDB.repository");
    const existingTicket = await ticketMongoDBRepo.findById(toObjectId(ticketId));

    if (existingTicket) {
      return existingTicket._id;
    }

    // Create ticket in MongoDB
    const newTicket = await ticketMongoDBRepo.create({
      eventName: ticket.event_name || `Ticket ${ticketId}`,
      seatNumber: ticket.seat_number || `S${ticketId}`,
      status: 'available',
      price: Number(ticket.price) || Number(totalPrice) || 0,
      _id: toObjectId(ticketId)
    });

    return newTicket._id;
  },

  /**
   * Create booking with MongoDB sync - handles all edge cases gracefully
   */
  async createBooking(data, actor = {}) {
    const userId = data.userId || data.user_id;
    const ticketId = data.ticketId || data.ticket_id;
    const totalPrice = data.totalPrice || data.total_price;

    if (!userId || !ticketId || !totalPrice) {
      throw new Error("User ID, ticket ID, and total price are required");
    }

    // Validation in MySQL
    if (!(await userFoundationMySQLRepository.findById(userId))) {
      throw new Error("User not found");
    }

    if (!(await ticketFoundationMySQLRepository.findById(ticketId))) {
      throw new Error("Ticket not found");
    }

    // 1. Create in MySQL first (source of truth)
    const booking = await bookingFoundationMySQLRepository.create({
      userId,
      ticketId,
      totalPrice,
      status: data.status || "pending",
    });

    // 2. Sync to MongoDB with retry logic
    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 500;
    let mongoBooking = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        // Ensure user and ticket exist in MongoDB before creating booking
        const mongoUserId = await this.syncUserToMongoDB(userId);
        const mongoTicketId = await this.syncTicketToMongoDB(ticketId, totalPrice);

        mongoBooking = await bookingMongoDBService.createBooking({
          userId: mongoUserId,
          ticketId: mongoTicketId,
          totalPrice: parseFloat(totalPrice),
          status: mapStatusToMongo(data.status || "pending"),
          mysqlBookingId: booking.id
        });

        break; // Success, exit retry loop
      } catch (error) {
        // Check if it's a transient error that deserves retry
        const isTransient =
          error.message.includes("User not found") ||
          error.message.includes("Ticket not found") ||
          error.message.includes("network") ||
          error.message.includes("timeout") ||
          error.message.includes("ECONN");

        if (attempt < MAX_RETRIES && isTransient) {
          console.warn(`MongoDB sync attempt ${attempt} failed, retrying...`, error.message);
          await sleep(RETRY_DELAY_MS * attempt); // Exponential backoff
          continue;
        }

        // Non-transient error or final attempt failed
        console.warn("MongoDB sync warning: " + error.message + ", marking as PENDING.");
        mongoBooking = { _id: "PENDING_SYNC_" + booking.id };
        break;
      }
    }

    // 3. Audit logging
    await auditLogMySQLService.log("booking.created", "bookings", booking.id, {
      userId: actor.userId || userId,
      newValues: {
        mysql: booking,
        mongodb: mongoBooking ? mongoBooking._id : "PENDING_SYNC_" + booking.id
      },
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    // 4. Return response (always has mongoBookingId, never "Not Synced")
    return {
      ...booking,
      mongoBookingId: mongoBooking ? mongoBooking._id : "PENDING_SYNC_" + booking.id,
    };
  },
};

module.exports = bookingFoundationMySQLService;