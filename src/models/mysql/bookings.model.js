module.exports = {
  tableName: "bookings",
  primaryKey: "id",
  fields: {
    userId: "user_id",
    matchId: "match_id",
    status: "status",
    totalPrice: "total_price",
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
  requiredFields: ["userId", "totalPrice"],
  defaultOrderBy: "id",
};
