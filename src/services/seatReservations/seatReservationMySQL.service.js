const createBaseMySQLService = require("../common/baseMySQL.service");
const mysqlConnection = require("../../connections/mysql.connection");
const seatReservationMySQLRepository = require("../../repositories/seatReservations/seatReservationMySQL.repository");
const matchMySQLRepository = require("../../repositories/matches/matchMySQL.repository");
const seatMySQLRepository = require("../../repositories/seats/seatMySQL.repository");
const bookingFoundationMySQLRepository = require("../../repositories/bookings/bookingFoundationMySQL.repository");
const ticketFoundationMySQLRepository = require("../../repositories/tickets/ticketFoundationMySQL.repository");
const auditLogMySQLService = require("../auditLogs/auditLogMySQL.service");
const socketHub = require("../../realtime/socketHub");

const seatReservationMySQLService = {
  ...createBaseMySQLService(seatReservationMySQLRepository),

  async reserve(data, actor = {}) {
    const matchId = data.matchId || data.match_id;
    const seatId = data.seatId || data.seat_id;
    const bookingId = data.bookingId || data.booking_id;
    const ticketId = data.ticketId || data.ticket_id;

    if (!(await matchMySQLRepository.findById(matchId))) {
      throw new Error("Match not found");
    }

    if (!(await seatMySQLRepository.findById(seatId))) {
      throw new Error("Seat not found");
    }

    if (bookingId && !(await bookingFoundationMySQLRepository.findById(bookingId))) {
      throw new Error("Booking not found");
    }

    if (ticketId && !(await ticketFoundationMySQLRepository.findById(ticketId))) {
      throw new Error("Ticket not found");
    }

    const connection = await mysqlConnection.getConnection();
    let reservation;
    try {
      await connection.beginTransaction();

      const [activeRows] = await connection.execute(
        `SELECT *
         FROM seat_reservations
         WHERE match_id = ?
           AND seat_id = ?
           AND status IN ('held', 'reserved', 'booked')
         LIMIT 1
         FOR UPDATE`,
        [matchId, seatId]
      );

      if (activeRows[0]) {
        throw new Error("Seat is already reserved for this match");
      }

      const [result] = await connection.execute(
        `INSERT INTO seat_reservations (match_id, seat_id, user_id, booking_id, status)
         VALUES (?, ?, ?, ?, ?)`,
        [
          matchId,
          seatId,
          data.userId || data.user_id || null,
          bookingId || null,
          data.status || "held",
        ]
      );

      await connection.commit();
      reservation = await seatReservationMySQLRepository.findById(result.insertId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    await auditLogMySQLService.log("seat.reserved", "seat_reservations", reservation.id, {
      userId: actor.userId || data.userId || data.user_id,
      newValues: reservation,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });
    await socketHub.emitSeatAvailability(matchId, { seatId, reservation });
    return reservation;
  },

  async release(id, actor = {}) {
    const existing = await seatReservationMySQLRepository.findById(id);
    if (!existing) {
      throw new Error("Seat reservation not found");
    }

    const roleNames = (actor.roles || []).map((role) => String(role.name || role).toLowerCase());
    if (actor.userId && !roleNames.includes("admin") && Number(existing.user_id || existing.userId) !== Number(actor.userId)) {
      throw new Error("You can only release your own seat reservation");
    }

    const reservation = await seatReservationMySQLRepository.release(id);
    await auditLogMySQLService.log("seat.released", "seat_reservations", id, {
      userId: actor.userId,
      oldValues: existing,
      newValues: reservation,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });
    await socketHub.emitSeatAvailability(reservation.match_id || reservation.matchId, { reservation });
    return reservation;
  },

  async getByMatchId(matchId) {
    return await seatReservationMySQLRepository.findByMatchId(matchId);
  },
};

module.exports = seatReservationMySQLService;
