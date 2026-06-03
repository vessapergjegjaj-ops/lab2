module.exports = {
  tableName: "seat_reservations",
  primaryKey: "id",
  fields: {
    matchId: "match_id",
    seatId: "seat_id",
    userId: "user_id",
    bookingId: "booking_id",
    status: "status",
  },
  requiredFields: ["matchId", "seatId"],
  defaultOrderBy: "id",
};
