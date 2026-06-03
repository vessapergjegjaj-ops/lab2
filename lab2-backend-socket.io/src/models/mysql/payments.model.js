module.exports = {
  tableName: "payments",
  primaryKey: "id",
  fields: {
    bookingId: "booking_id",
    userId: "user_id",
    discountId: "discount_id",
    amount: "amount",
    status: "status",
  },
  requiredFields: ["bookingId", "userId", "amount"],
  defaultOrderBy: "id",
};
