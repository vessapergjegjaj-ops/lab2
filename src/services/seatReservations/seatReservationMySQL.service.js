const createBaseMySQLService = require("../common/baseMySQL.service");
const seatReservationMySQLRepository = require("../../repositories/seatReservations/seatReservationMySQL.repository");
const matchMySQLRepository = require("../../repositories/matches/matchMySQL.repository");
const seatMySQLRepository = require("../../repositories/seats/seatMySQL.repository");
const bookingFoundationMySQLRepository = require("../../repositories/bookings/bookingFoundationMySQL.repository");
const ticketFoundationMySQLRepository = require("../../repositories/tickets/ticketFoundationMySQL.repository");
const auditLogMySQLService = require("../auditLogs/auditLogMySQL.service");

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

    const active = await seatReservationMySQLRepository.findActiveByMatchSeat(matchId, seatId);
    if (active) {
      throw new Error("Seat is already reserved for this match");
    }

    const reservation = await seatReservationMySQLRepository.create({
      ...data,
      status: data.status || "held",
    });

    await auditLogMySQLService.log("seat.reserved", "seat_reservations", reservation.id, {
      userId: actor.userId || data.userId || data.user_id,
      newValues: reservation,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });
    return reservation;
  },

  async release(id, actor = {}) {
    const existing = await seatReservationMySQLRepository.findById(id);
    if (!existing) {
      throw new Error("Seat reservation not found");
    }

    const reservation = await seatReservationMySQLRepository.release(id);
    await auditLogMySQLService.log("seat.released", "seat_reservations", id, {
      userId: actor.userId,
      oldValues: existing,
      newValues: reservation,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });
    return reservation;
  },

  async getByMatchId(matchId) {
    return await seatReservationMySQLRepository.findByMatchId(matchId);
  },
};

module.exports = seatReservationMySQLService;
