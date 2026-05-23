module.exports = {
  tableName: "bookings",
  primaryKey: "id",
  fields: {
    userId: "user_id",
    ticketId: "ticket_id",
    status: "status",
    totalPrice: "total_price",
    bookingDate: "booking_date",
  },
  requiredFields: ["userId", "ticketId", "totalPrice"],
  defaultOrderBy: "booking_date",
};
