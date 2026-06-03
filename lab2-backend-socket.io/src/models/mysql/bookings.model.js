module.exports = {
  tableName: "bookings",
  primaryKey: "id",
  fields: {
    userId: "user_id",
    status: "status",
    totalPrice: "total_price",
  },
  requiredFields: ["userId", "totalPrice"],
  defaultOrderBy: "id",
};
