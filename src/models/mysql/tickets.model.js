module.exports = {
  tableName: "tickets",
  primaryKey: "id",
  fields: {
    bookingId: "booking_id",
    matchId: "match_id",
    seatId: "seat_id",
    eventName: "event_name",
    seatNumber: "seat_number",
    price: "price",
    status: "status",
    userId: "user_id",
    createdAt: "created_at",
  },
  requiredFields: ["eventName", "seatNumber", "price"],
  defaultOrderBy: "event_name",
};
