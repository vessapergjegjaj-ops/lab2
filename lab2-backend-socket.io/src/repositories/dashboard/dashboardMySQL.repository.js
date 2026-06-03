const mysqlConnection = require("../../connections/mysql.connection");

const dashboardMySQLRepository = {
  async getAdminStats() {
    const [bookings] = await mysqlConnection.query("SELECT COUNT(*) AS total FROM bookings");
    const [matches] = await mysqlConnection.query(
      "SELECT COUNT(*) AS total FROM matches WHERE kickoff_at >= CURRENT_TIMESTAMP"
    );
    const [users] = await mysqlConnection.query("SELECT COUNT(*) AS total FROM users");
    const [payments] = await mysqlConnection.query(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'paid'"
    );

    return {
      totalBookings: Number(bookings?.total || 0),
      activeMatches: Number(matches?.total || 0),
      systemUserCount: Number(users?.total || 0),
      revenue: Number(payments?.total || 0),
    };
  },

  async getUserStats(userId) {
    const activeBookings = await mysqlConnection.query(
      `SELECT b.id,
              b.user_id,
              b.status,
              b.total_price,
              NULL AS ticket_id,
              NULL AS event_name,
              NULL AS seat_number,
              b.total_price AS ticket_price,
              NULL AS created_at
       FROM bookings b
       WHERE b.user_id = ? AND b.status IN ('pending', 'confirmed')
       ORDER BY b.id DESC`,
      [userId]
    );

    const upcomingReservations = await mysqlConnection.query(
      `SELECT sr.id,
              sr.match_id,
              sr.seat_id,
              sr.user_id,
              sr.booking_id,
              sr.status,
              m.kickoff_at,
              'scheduled' AS match_status,
              ht.name AS home_team_name, at.name AS away_team_name,
              se.section, NULL AS row_label, se.seat_number
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
      activeBookings: Array.isArray(activeBookings) ? activeBookings : [],
      upcomingReservations: Array.isArray(upcomingReservations) ? upcomingReservations : [],
    };
  },
};

module.exports = dashboardMySQLRepository;
