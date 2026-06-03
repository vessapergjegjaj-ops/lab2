const mysqlConnection = require('../../connections/mysql.connection');

const bookingMySQLRepository = {
  async findAll() {
    const sql = `SELECT b.*, u.name as user_name, u.email as user_email,
                  NULL AS ticket_id, NULL AS event_name, NULL AS seat_number,
                  b.total_price as ticket_price, NULL AS booking_date
                  FROM bookings b
                  LEFT JOIN users u ON b.user_id = u.id
                  ORDER BY b.id DESC`;
    return await mysqlConnection.query(sql);
  },

  async findById(id) {
    const sql = `SELECT b.*, u.name as user_name, u.email as user_email,
                  NULL AS ticket_id, NULL AS event_name, NULL AS seat_number,
                  b.total_price as ticket_price, NULL AS booking_date
                  FROM bookings b
                  LEFT JOIN users u ON b.user_id = u.id
                  WHERE b.id = ?`;
    const results = await mysqlConnection.query(sql, [id]);
    return results[0] || null;
  },

  async findByUserId(userId) {
    const sql = `SELECT b.*, u.name as user_name, u.email as user_email,
                  NULL AS ticket_id, NULL AS event_name, NULL AS seat_number,
                  b.total_price as ticket_price, NULL AS booking_date
                  FROM bookings b
                  LEFT JOIN users u ON b.user_id = u.id
                  WHERE b.user_id = ?
                  ORDER BY b.id DESC`;
    return await mysqlConnection.query(sql, [userId]);
  },

  async create(booking) {
    const sql = 'INSERT INTO bookings (user_id, status, total_price) VALUES (?, ?, ?)';
    const result = await mysqlConnection.query(sql, [
      booking.userId,
      booking.status || 'pending',
      booking.totalPrice
    ]);
    return { id: result.insertId, ...booking };
  },

  async update(id, booking) {
    const sql = 'UPDATE bookings SET user_id = ?, status = ?, total_price = ? WHERE id = ?';
    await mysqlConnection.query(sql, [
      booking.userId,
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
