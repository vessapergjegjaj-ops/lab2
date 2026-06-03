module.exports = {
  tableName: "tickets",
  primaryKey: "id",
  fields: {
    eventName: "event_name",
    seatNumber: "seat_number",
    price: "price",
    status: "status",
    userId: "user_id",
  },
  requiredFields: ["eventName", "seatNumber", "price"],
  defaultOrderBy: "event_name",
};
