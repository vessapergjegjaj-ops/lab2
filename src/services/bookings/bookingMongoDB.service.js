const bookingMongoDBRepository = require('../../repositories/bookings/bookingMongoDB.repository');

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
    return await bookingMongoDBRepository.create(booking);
  },

  async updateBooking(id, booking) {
    if (!booking.userId || !booking.ticketId || !booking.totalPrice) {
      throw new Error('User ID, ticket ID, and total price are required');
    }
    return await bookingMongoDBRepository.update(id, booking);
  },

  async deleteBooking(id) {
    return await bookingMongoDBRepository.delete(id);
  },
};

module.exports = bookingMongoDBService;