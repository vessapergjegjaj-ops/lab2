module.exports = {
  tableName: "seat_reservations",
  primaryKey: "id",
  fields: {
    matchId: "match_id",
    seatId: "seat_id",
    userId: "user_id",
    bookingId: "booking_id",
    ticketId: "ticket_id",
    status: "status",
    holdExpiresAt: "hold_expires_at",
    reservedAt: "reserved_at",
    releasedAt: "released_at",
  },
  requiredFields: ["matchId", "seatId"],
  defaultOrderBy: "reserved_at",
};
