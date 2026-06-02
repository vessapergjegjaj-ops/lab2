const bookingMySQLRepository = require('../../repositories/bookings/bookingMySQL.repository');
const userMySQLRepository = require('../../repositories/users/userMySQL.repository');
const ticketMySQLRepository = require('../../repositories/tickets/ticketMySQL.repository');
const mysqlConnection = require('../../connections/mysql.connection');

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

    const user = await userMySQLRepository.findById(booking.userId);
    if (!user) {
      throw new Error('User not found');
    }

    const ticket = await ticketMySQLRepository.findById(booking.ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    if (ticket.status !== 'available') {
      throw new Error('Ticket is not available for booking');
    }

    const existingBookingSql = 'SELECT * FROM bookings WHERE ticket_id = ? AND status != ?';
    const existingBookings = await mysqlConnection.query(existingBookingSql, [booking.ticketId, 'cancelled']);
    if (existingBookings.length > 0) {
      throw new Error('Ticket has already been booked');
    }

    const connection = await mysqlConnection.getConnection();
    try {
      await connection.beginTransaction();

      const insertBookingSql = 'INSERT INTO bookings (user_id, ticket_id, status, total_price) VALUES (?, ?, ?, ?)';
      const [result] = await connection.execute(insertBookingSql, [
        booking.userId,
        booking.ticketId,
        'confirmed',
        booking.totalPrice
      ]);

      const updateTicketSql = 'UPDATE tickets SET status = ?, user_id = ? WHERE id = ?';
      await connection.execute(updateTicketSql, ['booked', booking.userId, booking.ticketId]);

      await connection.commit();

      return await bookingMySQLRepository.findById(result.insertId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
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
