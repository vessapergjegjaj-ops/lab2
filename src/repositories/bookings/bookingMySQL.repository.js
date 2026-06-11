const mysqlConnection = require('../../connections/mysql.connection');

const bookingMySQLRepository = {
  async findAll() {
    const sql = `SELECT b.*, u.name AS user_name, u.email AS user_email,
                        ht.name AS home_team_name, at.name AS away_team_name,
                        s.name AS stadium_name, m.kickoff_at,
                        (SELECT COUNT(*) FROM tickets t WHERE t.booking_id = b.id) AS ticket_count
                 FROM bookings b
                 LEFT JOIN users u ON b.user_id = u.id
                 LEFT JOIN matches m ON m.id = b.match_id
                 LEFT JOIN teams ht ON ht.id = m.home_team_id
                 LEFT JOIN teams at ON at.id = m.away_team_id
                 LEFT JOIN stadiums s ON s.id = m.stadium_id
                 ORDER BY b.id DESC`;
    return await mysqlConnection.query(sql);
  },

  async findById(id) {
    const sql = `SELECT b.*, u.name AS user_name, u.email AS user_email,
                        ht.name AS home_team_name, at.name AS away_team_name,
                        s.name AS stadium_name, m.kickoff_at,
                        (SELECT COUNT(*) FROM tickets t WHERE t.booking_id = b.id) AS ticket_count
                 FROM bookings b
                 LEFT JOIN users u ON b.user_id = u.id
                 LEFT JOIN matches m ON m.id = b.match_id
                 LEFT JOIN teams ht ON ht.id = m.home_team_id
                 LEFT JOIN teams at ON at.id = m.away_team_id
                 LEFT JOIN stadiums s ON s.id = m.stadium_id
                 WHERE b.id = ?`;
    const results = await mysqlConnection.query(sql, [id]);
    return results[0] || null;
  },

  async findByUserId(userId) {
    const sql = `SELECT b.*, u.name AS user_name, u.email AS user_email,
                        ht.name AS home_team_name, at.name AS away_team_name,
                        s.name AS stadium_name, m.kickoff_at,
                        (SELECT COUNT(*) FROM tickets t WHERE t.booking_id = b.id) AS ticket_count
                 FROM bookings b
                 LEFT JOIN users u ON b.user_id = u.id
                 LEFT JOIN matches m ON m.id = b.match_id
                 LEFT JOIN teams ht ON ht.id = m.home_team_id
                 LEFT JOIN teams at ON at.id = m.away_team_id
                 LEFT JOIN stadiums s ON s.id = m.stadium_id
                 WHERE b.user_id = ?
                 ORDER BY b.id DESC`;
    return await mysqlConnection.query(sql, [userId]);
  },

  async create(booking) {
    const sql = 'INSERT INTO bookings (user_id, match_id, status, total_price) VALUES (?, ?, ?, ?)';
    const result = await mysqlConnection.query(sql, [
      booking.userId,
      booking.matchId || null,
      booking.status || 'pending',
      booking.totalPrice
    ]);
    return { id: result.insertId, ...booking };
  },

  async update(id, booking) {
    const sql = 'UPDATE bookings SET user_id = ?, match_id = ?, status = ?, total_price = ? WHERE id = ?';
    await mysqlConnection.query(sql, [
      booking.userId,
      booking.matchId || null,
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
