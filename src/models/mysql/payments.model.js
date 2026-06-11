module.exports = {
  tableName: "payments",
  primaryKey: "id",
  fields: {
    bookingId: "booking_id",
    userId: "user_id",
    discountId: "discount_id",
    amount: "amount",
    method: "method",
    status: "status",
    createdAt: "created_at",
  },
  requiredFields: ["bookingId", "userId", "amount"],
  defaultOrderBy: "id",
};
