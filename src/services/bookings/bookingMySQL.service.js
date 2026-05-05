const bookingMySQLRepository = require('../../repositories/bookings/bookingMySQL.repository');

const bookingMySQLService = {
  async getAllBookings() {
    return await bookingMySQLRepository.findAll();
  },

  async getBookingById(id) {
    return await bookingMySQLRepository.findById(id);
  },

  async getBookingsByUserId(userId) {
    return await bookingMySQLRepository.findByUserId(userId);
  },

  async createBooking(booking) {
    if (!booking.userId || !booking.ticketId || !booking.totalPrice) {
      throw new Error('User ID, ticket ID, and total price are required');
    }
    return await bookingMySQLRepository.create(booking);
  },

  async updateBooking(id, booking) {
    if (!booking.userId || !booking.ticketId || !booking.totalPrice) {
      throw new Error('User ID, ticket ID, and total price are required');
    }
    return await bookingMySQLRepository.update(id, booking);
  },

  async deleteBooking(id) {
    return await bookingMySQLRepository.delete(id);
  },
};

module.exports = bookingMySQLService;