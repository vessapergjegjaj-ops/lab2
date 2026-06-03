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
    if (!booking.userId || !booking.totalPrice) {
      throw new Error('User ID and total price are required');
    }

    const user = await userMySQLRepository.findById(booking.userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (booking.ticketId) {
      const ticket = await ticketMySQLRepository.findById(booking.ticketId);
      if (!ticket) {
        throw new Error('Ticket not found');
      }

      if (ticket.status !== 'available') {
        throw new Error('Ticket is not available for booking');
      }
    }

    const connection = await mysqlConnection.getConnection();
    try {
      await connection.beginTransaction();

      const insertBookingSql = 'INSERT INTO bookings (user_id, status, total_price) VALUES (?, ?, ?)';
      const [result] = await connection.execute(insertBookingSql, [
        booking.userId,
        'confirmed',
        booking.totalPrice
      ]);

      if (booking.ticketId) {
        const updateTicketSql = 'UPDATE tickets SET status = ?, user_id = ? WHERE id = ?';
        await connection.execute(updateTicketSql, ['booked', booking.userId, booking.ticketId]);
      }

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
    if (!booking.userId || !booking.totalPrice) {
      throw new Error('User ID and total price are required');
    }
    return await bookingMySQLRepository.update(id, booking);
  },

  async deleteBooking(id) {
    return await bookingMySQLRepository.delete(id);
  },
};

module.exports = bookingMySQLService;
