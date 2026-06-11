const mysqlConnection = require("../connections/mysql.connection");
const dashboardMySQLRepository = require("../repositories/dashboard/dashboardMySQL.repository");

const allowedResources = new Set(["matches", "teams", "bookings", "users", "tickets", "payments", "stadiums"]);

const like = (value) => "%" + String(value || "").trim() + "%";

const tableQueries = {
  matches: {
    sql: `SELECT m.id, m.kickoff_at, m.status, m.base_ticket_price,
                 CONCAT(ht.name, ' vs ', at.name) AS name,
                 ht.name AS home_team_name,
                 at.name AS away_team_name,
                 s.name AS stadium_name
          FROM matches m
          INNER JOIN teams ht ON ht.id = m.home_team_id
          INNER JOIN teams at ON at.id = m.away_team_id
          INNER JOIN stadiums s ON s.id = m.stadium_id`,
    search: ["ht.name", "at.name", "s.name", "m.status"],
    dateField: "m.kickoff_at",
    statusField: "m.status",
    order: "m.kickoff_at DESC",
  },
  teams: {
    sql: `SELECT t.*, l.name AS league_name
          FROM teams t
          LEFT JOIN leagues l ON l.id = t.league_id`,
    search: ["t.name", "l.name"],
    order: "t.name ASC",
  },
  bookings: {
    sql: `SELECT b.*, u.email AS user_email,
                 CONCAT(ht.name, ' vs ', at.name) AS match_name
          FROM bookings b
          LEFT JOIN users u ON u.id = b.user_id
          LEFT JOIN matches m ON m.id = b.match_id
          LEFT JOIN teams ht ON ht.id = m.home_team_id
          LEFT JOIN teams at ON at.id = m.away_team_id`,
    search: ["u.email", "b.status", "ht.name", "at.name"],
    dateField: "b.created_at",
    statusField: "b.status",
    order: "b.id DESC",
  },
  users: {
    sql: "SELECT id, name, username, email, created_at FROM users",
    search: ["name", "username", "email"],
    dateField: "created_at",
    order: "id DESC",
  },
  tickets: {
    sql: "SELECT * FROM tickets",
    search: ["event_name", "seat_number", "status"],
    dateField: "created_at",
    statusField: "status",
    order: "id DESC",
  },
  payments: {
    sql: "SELECT * FROM payments",
    search: ["method", "status"],
    dateField: "created_at",
    statusField: "status",
    order: "id DESC",
  },
  stadiums: {
    sql: "SELECT * FROM stadiums",
    search: ["name", "location"],
    order: "name ASC",
  },
};

const buildQuery = (resource, filters = {}) => {
  const config = tableQueries[resource];
  const where = [];
  const params = [];

  if (filters.search && config.search?.length) {
    where.push("(" + config.search.map((field) => field + " LIKE ?").join(" OR ") + ")");
    params.push(...config.search.map(() => like(filters.search)));
  }

  if (filters.status && config.statusField) {
    where.push(config.statusField + " = ?");
    params.push(filters.status);
  }

  if (filters.dateFrom && config.dateField) {
    where.push(config.dateField + " >= ?");
    params.push(filters.dateFrom);
  }

  if (filters.dateTo && config.dateField) {
    where.push(config.dateField + " <= ?");
    params.push(filters.dateTo);
  }

  const limit = Math.min(Number(filters.limit || 100), 500);
  const sql = config.sql
    + (where.length ? " WHERE " + where.join(" AND ") : "")
    + " ORDER BY " + config.order
    + " LIMIT ?";
  params.push(limit);

  return { sql, params };
};

const assertResource = (resource) => {
  if (!allowedResources.has(resource)) {
    throw new Error("Unsupported resource: " + resource);
  }
};

const toCsv = (rows) => {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (value) => {
    const text = value === null || value === undefined ? "" : String(value);
    return /[",\n\r]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
  };
  return [headers.join(","), ...rows.map((row) => headers.map((header) => escape(row[header])).join(","))].join("\n");
};

const toExcelHtml = (rows) => {
  if (!rows.length) return "<table></table>";
  const headers = Object.keys(rows[0]);
  const cell = (value) => String(value ?? "").replace(/[<>&]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[char]));
  return `<table><thead><tr>${headers.map((h) => `<th>${cell(h)}</th>`).join("")}</tr></thead><tbody>${
    rows.map((row) => `<tr>${headers.map((h) => `<td>${cell(row[h])}</td>`).join("")}</tr>`).join("")
  }</tbody></table>`;
};

const adminDataMySQLService = {
  async search(resource, filters = {}) {
    assertResource(resource);
    const query = buildQuery(resource, filters);
    return await mysqlConnection.query(query.sql, query.params);
  },

  async reports(filters = {}) {
    const stats = await dashboardMySQLRepository.getAdminStats(filters);
    return {
      bookingReport: {
        totalBookings: stats.totalBookings,
        recentBookings: stats.recentBookings,
      },
      revenueReport: {
        totalRevenue: stats.revenue,
        revenueByMatch: stats.revenueByMatch,
      },
      stadiumOccupancyReport: {
        totalSeats: stats.totalSeats,
        availableSeats: stats.availableSeats,
        heldSeats: stats.heldSeats,
        reservedSeats: stats.reservedSeats,
        bookedSeats: stats.bookedSeats,
        occupancyPercentage: stats.occupancyPercentage,
      },
      paymentReport: {
        totalPayments: stats.totalPayments,
        paidPayments: stats.paidPayments,
        pendingPayments: stats.pendingPayments,
        failedPayments: stats.failedPayments,
        recentPayments: stats.recentPayments,
      },
      ticketSalesReport: {
        totalTickets: stats.totalTickets,
        revenueByMatch: stats.revenueByMatch,
      },
    };
  },

  async export(resource, format, filters = {}) {
    const rows = await this.search(resource, { ...filters, limit: 500 });
    if (format === "json") {
      return { contentType: "application/json", extension: "json", body: JSON.stringify(rows, null, 2) };
    }
    if (format === "xls" || format === "xlsx") {
      return { contentType: "application/vnd.ms-excel", extension: "xls", body: toExcelHtml(rows) };
    }
    return { contentType: "text/csv", extension: "csv", body: toCsv(rows) };
  },

  async import(resource, records = []) {
    assertResource(resource);
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error("Import records are required");
    }

    let inserted = 0;
    for (const record of records) {
      if (resource === "matches") {
        await mysqlConnection.query(
          `INSERT INTO matches (league_id, stadium_id, home_team_id, away_team_id, kickoff_at, status, base_ticket_price)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            record.leagueId || record.league_id || null,
            record.stadiumId || record.stadium_id,
            record.homeTeamId || record.home_team_id,
            record.awayTeamId || record.away_team_id,
            record.kickoffAt || record.kickoff_at,
            record.status || "scheduled",
            record.baseTicketPrice || record.base_ticket_price || 50,
          ]
        );
      } else if (resource === "bookings") {
        await mysqlConnection.query(
          "INSERT INTO bookings (user_id, match_id, status, total_price) VALUES (?, ?, ?, ?)",
          [record.userId || record.user_id, record.matchId || record.match_id || null, record.status || "pending", record.totalPrice || record.total_price || 0]
        );
      } else if (resource === "tickets") {
        await mysqlConnection.query(
          `INSERT INTO tickets (booking_id, match_id, seat_id, event_name, seat_number, price, status, user_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            record.bookingId || record.booking_id || null,
            record.matchId || record.match_id || null,
            record.seatId || record.seat_id || null,
            record.eventName || record.event_name || "Imported ticket",
            record.seatNumber || record.seat_number || "N/A",
            record.price || 0,
            record.status || "available",
            record.userId || record.user_id || null,
          ]
        );
      } else if (resource === "payments") {
        await mysqlConnection.query(
          "INSERT INTO payments (booking_id, user_id, amount, method, status) VALUES (?, ?, ?, ?, ?)",
          [record.bookingId || record.booking_id, record.userId || record.user_id, record.amount || 0, record.method || "card", record.status || "pending"]
        );
      } else if (resource === "users") {
        await mysqlConnection.query(
          "INSERT INTO users (name, username, email, password_hash) VALUES (?, ?, ?, ?)",
          [record.name, record.username || null, record.email, record.passwordHash || record.password_hash || null]
        );
      } else {
        throw new Error("Import is supported for bookings, users, tickets, matches and payments");
      }
      inserted += 1;
    }

    return { inserted };
  },
};

module.exports = adminDataMySQLService;
