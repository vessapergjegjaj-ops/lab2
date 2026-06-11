const bookingMySQLRepository = require("../../repositories/bookings/bookingMySQL.repository");
const mysqlConnection = require("../../connections/mysql.connection");
const notificationMySQLService = require("../notifications/notificationMySQL.service");
const socketHub = require("../../realtime/socketHub");

const activeStatuses = ["held", "reserved", "booked"];

const normalizeSeatIds = (booking = {}) => {
  const source = booking.seatIds || booking.seats || booking.selectedSeats || [];
  return [...new Set(source.map((seat) => Number(seat.id || seat.seatId || seat)).filter(Boolean))];
};

const mapBooking = (booking) => ({
  ...booking,
  id: booking.id,
  userId: booking.user_id || booking.userId,
  matchId: booking.match_id || booking.matchId,
  totalPrice: Number(booking.total_price || booking.totalPrice || 0),
});

const buildEventName = (match) => {
  return [match.home_team_name || "Home", match.away_team_name || "Away"].join(" vs ");
};

const loadBookingDetails = async (bookingId) => {
  const booking = await bookingMySQLRepository.findById(bookingId);
  if (!booking) {
    return null;
  }

  const tickets = await mysqlConnection.query(
    `SELECT t.*, se.section, se.seat_number AS seat_label
     FROM tickets t
     LEFT JOIN seats se ON se.id = t.seat_id
     WHERE t.booking_id = ?
     ORDER BY t.id ASC`,
    [bookingId]
  );

  return {
    ...mapBooking(booking),
    tickets,
    seats: tickets.map((ticket) => ({
      id: ticket.seat_id,
      label: ticket.seat_number,
      price: Number(ticket.price || 0),
      ticketId: ticket.id,
    })),
  };
};

const bookingMySQLService = {
  async getAllBookings() {
    return await bookingMySQLRepository.findAll();
  },

  async getBookingById(id) {
    return await loadBookingDetails(id);
  },

  async getBookingsByUserId(userId) {
    return await bookingMySQLRepository.findByUserId(userId);
  },

  async createBooking(booking, actor = {}) {
    const userId = actor.userId || booking.userId || booking.user_id;
    const matchId = Number(booking.matchId || booking.match_id);
    const seatIds = normalizeSeatIds(booking);

    if (!userId) {
      throw new Error("Authentication is required to create a booking");
    }

    if (!matchId || seatIds.length === 0) {
      throw new Error("Match and at least one seat are required");
    }

    const connection = await mysqlConnection.getConnection();
    let bookingId;
    let eventName;

    try {
      await connection.beginTransaction();

      const [matchRows] = await connection.execute(
        `SELECT m.*, ht.name AS home_team_name, at.name AS away_team_name
         FROM matches m
         INNER JOIN teams ht ON ht.id = m.home_team_id
         INNER JOIN teams at ON at.id = m.away_team_id
         WHERE m.id = ?
         FOR UPDATE`,
        [matchId]
      );

      const match = matchRows[0];
      if (!match) {
        throw new Error("Match not found");
      }

      eventName = buildEventName(match);

      const placeholders = seatIds.map(() => "?").join(",");
      const [seats] = await connection.execute(
        `SELECT se.*, COALESCE(se.price, ?, 50) AS booking_price
         FROM seats se
         WHERE se.stadium_id = ? AND se.id IN (${placeholders})
         FOR UPDATE`,
        [match.base_ticket_price || 50, match.stadium_id, ...seatIds]
      );

      if (seats.length !== seatIds.length) {
        throw new Error("One or more seats do not belong to this match stadium");
      }

      const reservationsBySeat = new Map();
      for (const seatId of seatIds) {
        const [reservationRows] = await connection.execute(
          `SELECT *
           FROM seat_reservations
           WHERE match_id = ?
             AND seat_id = ?
             AND status IN ('held', 'reserved', 'booked')
           LIMIT 1
           FOR UPDATE`,
          [matchId, seatId]
        );

        const reservation = reservationRows[0];
        if (reservation && Number(reservation.user_id) !== Number(userId)) {
          throw new Error("Seat " + seatId + " is already reserved by another user");
        }

        if (reservation && reservation.status === "booked") {
          throw new Error("Seat " + seatId + " is already booked");
        }

        reservationsBySeat.set(seatId, reservation || null);
      }

      const totalPrice = seats.reduce((sum, seat) => sum + Number(seat.booking_price || 0), 0);
      const [bookingResult] = await connection.execute(
        `INSERT INTO bookings (user_id, match_id, status, total_price)
         VALUES (?, ?, 'pending', ?)`,
        [userId, matchId, totalPrice]
      );
      bookingId = bookingResult.insertId;

      for (const seat of seats) {
        const reservation = reservationsBySeat.get(Number(seat.id));
        if (reservation) {
          await connection.execute(
            `UPDATE seat_reservations
             SET booking_id = ?, status = 'booked'
             WHERE id = ?`,
            [bookingId, reservation.id]
          );
        } else {
          await connection.execute(
            `INSERT INTO seat_reservations (match_id, seat_id, user_id, booking_id, status)
             VALUES (?, ?, ?, ?, 'booked')`,
            [matchId, seat.id, userId, bookingId]
          );
        }

        const seatLabel = [seat.section, seat.seat_number].filter(Boolean).join("-");
        await connection.execute(
          `INSERT INTO tickets (booking_id, match_id, seat_id, event_name, seat_number, price, status, user_id)
           VALUES (?, ?, ?, ?, ?, ?, 'booked', ?)`,
          [bookingId, matchId, seat.id, eventName, seatLabel, seat.booking_price, userId]
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    const created = await loadBookingDetails(bookingId);

    try {
      await notificationMySQLService.createNotification({
        userId,
        type: "booking",
        title: "Booking created",
        message: "Your booking #" + bookingId + " for " + eventName + " was created.",
        relatedEntityType: "booking",
        relatedEntityId: String(bookingId),
      });
    } catch (error) {
      if (error.code !== "ER_NO_SUCH_TABLE") {
        throw error;
      }
    }

    socketHub.emit("bookingCreated", created);
    await socketHub.emitSeatAvailability(matchId, { booking: created });
    socketHub.emitDashboardUpdated({ reason: "bookingCreated", booking: created });

    return created;
  },

  async updateBooking(id, booking) {
    if (!booking.userId || !booking.totalPrice) {
      throw new Error("User ID and total price are required");
    }
    return await bookingMySQLRepository.update(id, booking);
  },

  async deleteBooking(id) {
    return await bookingMySQLRepository.delete(id);
  },
};

module.exports = bookingMySQLService;
