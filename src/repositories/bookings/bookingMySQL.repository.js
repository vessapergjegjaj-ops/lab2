const mysqlConnection = require('../../connections/mysql.connection');

const bookingMySQLRepository = {
  async findAll() {
    const sql = `SELECT b.*, u.name as user_name, u.email as user_email,
                  t.event_name, t.seat_number, t.price as ticket_price
                  FROM bookings b
                  LEFT JOIN users u ON b.user_id = u.id
                  LEFT JOIN tickets t ON b.ticket_id = t.id
                  ORDER BY b.booking_date DESC`;
    return await mysqlConnection.query(sql);
  },

  async findById(id) {
    const sql = `SELECT b.*, u.name as user_name, u.email as user_email,
                  t.event_name, t.seat_number, t.price as ticket_price
                  FROM bookings b
                  LEFT JOIN users u ON b.user_id = u.id
                  LEFT JOIN tickets t ON b.ticket_id = t.id
                  WHERE b.id = ?`;
    const results = await mysqlConnection.query(sql, [id]);
    return results[0] || null;
  },

  async findByUserId(userId) {
    const sql = `SELECT b.*, u.name as user_name, u.email as user_email,
                  t.event_name, t.seat_number, t.price as ticket_price
                  FROM bookings b
                  LEFT JOIN users u ON b.user_id = u.id
                  LEFT JOIN tickets t ON b.ticket_id = t.id
                  WHERE b.user_id = ?
                  ORDER BY b.booking_date DESC`;
    return await mysqlConnection.query(sql, [userId]);
  },

  async create(booking) {
    const sql = 'INSERT INTO bookings (user_id, ticket_id, status, total_price) VALUES (?, ?, ?, ?)';
    const result = await mysqlConnection.query(sql, [
      booking.userId,
      booking.ticketId,
      booking.status || 'pending',
      booking.totalPrice
    ]);
    return { id: result.insertId, ...booking };
  },

  async update(id, booking) {
    const sql = 'UPDATE bookings SET user_id = ?, ticket_id = ?, status = ?, total_price = ? WHERE id = ?';
    await mysqlConnection.query(sql, [
      booking.userId,
      booking.ticketId,
      booking.status,
      booking.totalPrice,
      id
    ]);
    return await this.findById(id);
  },

  async delete(id) {
    const sql = 'DELETE FROM bookings WHERE id = ?';
    const result = await mysqlConnection.query(sql, [id]);
    return result.affectedRows > 0;
  },
};

module.exports = bookingMySQLRepository;