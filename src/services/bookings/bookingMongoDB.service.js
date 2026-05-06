const bookingMongoDBRepository = require('../../repositories/bookings/bookingMongoDB.repository');
const userMongoDBRepository = require('../../repositories/users/userMongoDB.repository');
const ticketMongoDBRepository = require('../../repositories/tickets/ticketMongoDB.repository');
const mongoose = require('mongoose');

const Booking = mongoose.models.Booking || mongoose.model('Booking', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  ticketId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Ticket' },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  totalPrice: { type: Number, required: true },
  bookingDate: { type: Date, default: Date.now },
  cancelledAt: { type: Date, default: null },
  cancelledBy: { type: String, enum: ['user', 'system', 'admin'], default: null },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  paymentMethod: { type: String, default: null },
  paidAt: { type: Date, default: null },
}));

const PENDING_TIMEOUT_MINUTES = 15;

const bookingMongoDBService = {
  async getAllBookings() {
    return await bookingMongoDBRepository.findAll();
  },

  async getBookingById(id) {
    return await bookingMongoDBRepository.findById(id);
  },

  async getBookingsByUserId(userId) {
    return await bookingMongoDBRepository.findByUserId(userId);
  },

  async createBooking(booking) {
    if (!booking.userId || !booking.ticketId || !booking.totalPrice) {
      throw new Error('User ID, ticket ID, and total price are required');
    }

    const user = await userMongoDBRepository.findById(booking.userId);
    if (!user) {
      throw new Error('User not found');
    }

    const ticket = await ticketMongoDBRepository.findById(booking.ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    if (ticket.status !== 'available') {
      throw new Error('Ticket is not available for booking');
    }

    const existingUserBooking = await Booking.findOne({
      userId: booking.userId,
      ticketId: booking.ticketId,
      status: { '$in': ['pending', 'confirmed'] }
    });
    if (existingUserBooking) {
      throw new Error('You already have a booking for this ticket');
    }

    const existingBooking = await Booking.findOne({
      ticketId: booking.ticketId,
      status: { '$in': ['pending', 'confirmed'] }
    });
    if (existingBooking) {
      throw new Error('Ticket has already been booked');
    }

    const createdBooking = await bookingMongoDBRepository.create(booking);

    await ticketMongoDBRepository.update(booking.ticketId, {
      status: 'booked',
      userId: booking.userId
    });

    return createdBooking;
  },

 async updateBooking(id, updateData) {
    const booking = await bookingMongoDBRepository.findById(id);
    if (!booking) {
      throw new Error('Booking not found');
    }
    return await bookingMongoDBRepository.update(id, updateData);
  },

  async deleteBooking(id) {
    return await bookingMongoDBRepository.delete(id);
  },

  async cancelBooking(id, cancelledBy = 'user') {
    const booking = await bookingMongoDBRepository.findById(id);
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status === 'cancelled') {
      throw new Error('Booking is already cancelled');
    }

    const updatedBooking = await bookingMongoDBRepository.update(id, {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelledBy: cancelledBy
    });

    await ticketMongoDBRepository.update(booking.ticketId, {
      status: 'available',
      userId: null
    });

    return updatedBooking;
  },

  async confirmBooking(id) {
    const booking = await bookingMongoDBRepository.findById(id);
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status !== 'pending') {
      throw new Error('Only pending bookings can be confirmed');
    }

    return await bookingMongoDBRepository.update(id, {
      status: 'confirmed',
      paymentStatus: 'paid',
      paidAt: new Date()
    });
  },

  async checkAndCancelExpiredPendingBookings() {
    const expiredTime = new Date(Date.now() - (PENDING_TIMEOUT_MINUTES * 60 * 1000));
    const expiredBookings = await Booking.find({
      status: 'pending',
      bookingDate: { '$lt': expiredTime }
    });

    for (const booking of expiredBookings) {
      try {
        await this.cancelBooking(booking._id, 'system');
      } catch (err) {
        console.error(`Failed to cancel expired booking ${booking._id}:`, err.message);
      }
    }

    return expiredBookings.length;
  },
};

module.exports = bookingMongoDBService;
