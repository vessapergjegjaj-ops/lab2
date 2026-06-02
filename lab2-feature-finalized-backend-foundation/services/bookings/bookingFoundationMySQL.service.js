const createBaseMySQLService = require("../common/baseMySQL.service");
const bookingFoundationMySQLRepository = require("../../repositories/bookings/bookingFoundationMySQL.repository");
const userFoundationMySQLRepository = require("../../repositories/users/userFoundationMySQL.repository");
const ticketFoundationMySQLRepository = require("../../repositories/tickets/ticketFoundationMySQL.repository");
const bookingMongoDBService = require("./bookingMongoDB.service");
const userMongoDBService = require("../users/userMongoDB.service");
const ticketMongoDBService = require("../tickets/ticketMongoDB.service");
const auditLogMySQLService = require("../auditLogs/auditLogMySQL.service");
const mongoose = require('mongoose');
const crypto = require('crypto');

const MAX_RETRIES = 3;

// Funksion për të konvertuar ID-të në ObjectId të MongoDB të vlefshëm
const toObjectId = (id) => {
  const strId = String(id);
  // Kontrollo nëse është już një ObjectId të vlefshëm
  if (mongoose.Types.ObjectId.isValid(strId)) {
    return strId;
  }
  // Krijo një hash nga string-i për të marrë 12 bytes
  const hash = crypto.createHash('md5').update(strId).digest();
  const buffer = Buffer.alloc(12);
  hash.copy(buffer, 0, 0, 12);
  return new mongoose.Types.ObjectId(buffer).toString();
};

// Funksion për të retry-uar operation-e me backoff eksponencjal
const retryOperation = async (operation) => {
  let lastError;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (i === MAX_RETRIES - 1) throw error;
      // Backoff eksponencjal: 100ms, 200ms, 400ms
      await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, i)));
    }
  }
  throw lastError;
};

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

  async createBooking(data, actor = {}) {
    const userId = data.userId || data.user_id;
    const ticketId = data.ticketId || data.ticket_id;
    const totalPrice = data.totalPrice || data.total_price;

    if (!userId || !ticketId || !totalPrice) {
      throw new Error("User ID, ticket ID, and total price are required");
    }

    // Validimi në MySQL
    if (!(await userFoundationMySQLRepository.findById(userId))) {
      throw new Error("User not found");
    }

    if (!(await ticketFoundationMySQLRepository.findById(ticketId))) {
      throw new Error("Ticket not found");
    }

    // 1. Krijimi në MySQL
    const booking = await bookingFoundationMySQLRepository.create({
      userId,
      ticketId,
      totalPrice,
      status: data.status || "pending",
    });

    // 2. Përgatitja e ID-tëve për MongoDB
    const mongoUserId = toObjectId(userId);
    const mongoTicketId = toObjectId(ticketId);

    // 3. Sinkronizimi me MongoDB me logikë të miglioruar
    let mongoBooking = null;
    try {
      // Sigurohuni që përdoruesi ekzistojë në MongoDB
      await retryOperation(async () => {
        let user = await userMongoDBService.findById(mongoUserId);
        if (!user) {
          user = await userMongoDBService.create({ _id: mongoUserId });
        }
        return user;
      });

      // Sigurohuni që billeta ekzistojë në MongoDB
      await retryOperation(async () => {
        let ticket = await ticketMongoDBService.findById(mongoTicketId);
        if (!ticket) {
          ticket = await ticketMongoDBService.create({ _id: mongoTicketId });
        }
        return ticket;
      });

      // Krijoni rezervimin në MongoDB
      mongoBooking = await retryOperation(async () => {
        return await bookingMongoDBService.createBooking({
          userId: mongoUserId,
          ticketId: mongoTicketId,
          totalPrice: parseFloat(totalPrice),
          status: data.status || "pending",
          mysqlBookingId: booking.id
        });
      });
    } catch (error) {
      console.error("MongoDB sync error after retries:", error.message);
      // Vendosni ID-in e pending sinkronizimit
      mongoBooking = { _id: `PENDING_SYNC_${booking.id}` };
    }

    // 4. Logimi i audit-it
    await auditLogMySQLService.log("booking.created", "bookings", booking.id, {
      userId: actor.userId || userId,
      newValues: { 
        mysql: booking, 
        mongodb: mongoBooking._id 
      },
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    // 5. Kthimi i përgjigjes me format të konsistent
    return {
      ...booking,
      mongoBookingId: mongoBooking._id,
    };
  },
};

module.exports = bookingFoundationMySQLService;