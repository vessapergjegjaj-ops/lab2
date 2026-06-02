const mysqlConnection = require("../../connections/mysql.connection");

const dashboardMySQLRepository = {
  async getAdminStats() {
    const [bookings] = await mysqlConnection.query("SELECT COUNT(*) AS total FROM bookings");
    const [matches] = await mysqlConnection.query(
      "SELECT COUNT(*) AS total FROM matches WHERE status IN ('scheduled', 'on_sale', 'in_progress')"
    );
    const [users] = await mysqlConnection.query("SELECT COUNT(*) AS total FROM users");

    return {
      totalBookings: bookings.total,
      activeMatches: matches.total,
      systemUserCount: users.total,
    };
  },

  async getUserStats(userId) {
    const activeBookings = await mysqlConnection.query(
      `SELECT b.*, t.event_name, t.seat_number, t.price AS ticket_price
       FROM bookings b
       LEFT JOIN tickets t ON t.id = b.ticket_id
       WHERE b.user_id = ? AND b.status IN ('pending', 'confirmed')
       ORDER BY b.booking_date DESC`,
      [userId]
    );

    const upcomingReservations = await mysqlConnection.query(
      `SELECT sr.*, m.kickoff_at, m.status AS match_status,
              ht.name AS home_team_name, at.name AS away_team_name,
              se.section, se.row_label, se.seat_number
       FROM seat_reservations sr
       INNER JOIN matches m ON m.id = sr.match_id
       INNER JOIN teams ht ON ht.id = m.home_team_id
       INNER JOIN teams at ON at.id = m.away_team_id
       INNER JOIN seats se ON se.id = sr.seat_id
       WHERE sr.user_id = ?
         AND sr.status IN ('held', 'reserved', 'booked')
         AND m.kickoff_at >= CURRENT_TIMESTAMP
       ORDER BY m.kickoff_at ASC`,
      [userId]
    );

    return {
      activeBookings,
      upcomingReservations,
    };
  },
};

module.exports = dashboardMySQLRepository;
