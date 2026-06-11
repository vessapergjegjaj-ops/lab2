const mysqlConnection = require("../../connections/mysql.connection");

const firstNumber = (rows, key = "total") => Number((rows && rows[0] && rows[0][key]) || 0);

const dashboardMySQLRepository = {
  async getAdminStats(filters = {}) {
    const dateParams = [];
    const dateWhere = [];

    if (filters.dateFrom) {
      dateWhere.push("b.created_at >= ?");
      dateParams.push(filters.dateFrom);
    }

    if (filters.dateTo) {
      dateWhere.push("b.created_at <= ?");
      dateParams.push(filters.dateTo);
    }

    const bookingWhere = dateWhere.length ? " WHERE " + dateWhere.join(" AND ") : "";

    const bookings = await mysqlConnection.query("SELECT COUNT(*) AS total FROM bookings" + bookingWhere, dateParams);
    const matches = await mysqlConnection.query("SELECT COUNT(*) AS total FROM matches");
    const users = await mysqlConnection.query("SELECT COUNT(*) AS total FROM users");
    const tickets = await mysqlConnection.query("SELECT COUNT(*) AS total FROM tickets");
    const payments = await mysqlConnection.query("SELECT COUNT(*) AS total FROM payments");
    const revenue = await mysqlConnection.query(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'paid'"
    );
    const paymentStatus = await mysqlConnection.query(
      `SELECT status, COUNT(*) AS total, COALESCE(SUM(amount), 0) AS amount
       FROM payments
       GROUP BY status`
    );
    const seatStatus = await mysqlConnection.query(
      `SELECT status, COUNT(*) AS total
       FROM seat_reservations
       WHERE status IN ('held', 'reserved', 'booked')
       GROUP BY status`
    );
    const totalSeats = firstNumber(await mysqlConnection.query("SELECT COUNT(*) AS total FROM seats"));
    const occupiedSeats = seatStatus.reduce((sum, row) => sum + Number(row.total || 0), 0);
    const recentBookings = await mysqlConnection.query(
      `SELECT b.*, u.email AS user_email, ht.name AS home_team_name, at.name AS away_team_name
       FROM bookings b
       LEFT JOIN users u ON u.id = b.user_id
       LEFT JOIN matches m ON m.id = b.match_id
       LEFT JOIN teams ht ON ht.id = m.home_team_id
       LEFT JOIN teams at ON at.id = m.away_team_id
       ORDER BY b.id DESC
       LIMIT 8`
    );
    const recentPayments = await mysqlConnection.query(
      `SELECT p.*, u.email AS user_email
       FROM payments p
       LEFT JOIN users u ON u.id = p.user_id
       ORDER BY p.id DESC
       LIMIT 8`
    );
    const revenueByMatch = await mysqlConnection.query(
      `SELECT m.id AS match_id,
              CONCAT(ht.name, ' vs ', at.name) AS match_name,
              COALESCE(SUM(p.amount), 0) AS revenue,
              COUNT(DISTINCT b.id) AS bookings
       FROM matches m
       INNER JOIN teams ht ON ht.id = m.home_team_id
       INNER JOIN teams at ON at.id = m.away_team_id
       LEFT JOIN bookings b ON b.match_id = m.id
       LEFT JOIN payments p ON p.booking_id = b.id AND p.status = 'paid'
       GROUP BY m.id, ht.name, at.name
       ORDER BY revenue DESC`
    );

    const paymentBreakdown = paymentStatus.reduce(
      (acc, row) => ({ ...acc, [row.status]: { count: Number(row.total || 0), amount: Number(row.amount || 0) } }),
      {}
    );
    const seatBreakdown = seatStatus.reduce(
      (acc, row) => ({ ...acc, [row.status]: Number(row.total || 0) }),
      {}
    );

    return {
      totalBookings: firstNumber(bookings),
      totalMatches: firstNumber(matches),
      activeMatches: firstNumber(await mysqlConnection.query("SELECT COUNT(*) AS total FROM matches WHERE kickoff_at >= CURRENT_TIMESTAMP")),
      totalUsers: firstNumber(users),
      systemUserCount: firstNumber(users),
      totalTickets: firstNumber(tickets),
      totalPayments: firstNumber(payments),
      revenue: firstNumber(revenue),
      paidPayments: paymentBreakdown.paid?.count || 0,
      pendingPayments: paymentBreakdown.pending?.count || 0,
      failedPayments: paymentBreakdown.failed?.count || 0,
      availableSeats: Math.max(totalSeats - occupiedSeats, 0),
      heldSeats: seatBreakdown.held || 0,
      reservedSeats: seatBreakdown.reserved || 0,
      bookedSeats: seatBreakdown.booked || 0,
      totalSeats,
      occupancyPercentage: totalSeats ? Math.round((occupiedSeats / totalSeats) * 100) : 0,
      recentBookings,
      recentPayments,
      revenueByMatch,
      paymentBreakdown,
    };
  },

  async getUserStats(userId) {
    const activeBookings = await mysqlConnection.query(
      `SELECT b.*, ht.name AS home_team_name, at.name AS away_team_name, m.kickoff_at
       FROM bookings b
       LEFT JOIN matches m ON m.id = b.match_id
       LEFT JOIN teams ht ON ht.id = m.home_team_id
       LEFT JOIN teams at ON at.id = m.away_team_id
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
              m.status AS match_status,
              ht.name AS home_team_name, at.name AS away_team_name,
              se.section, se.seat_number
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
