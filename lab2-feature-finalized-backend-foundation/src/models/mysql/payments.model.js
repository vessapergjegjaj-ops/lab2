module.exports = {
  tableName: "payments",
  primaryKey: "id",
  fields: {
    bookingId: "booking_id",
    userId: "user_id",
    discountId: "discount_id",
    provider: "provider",
    providerPaymentId: "provider_payment_id",
    amount: "amount",
    currency: "currency",
    status: "status",
    method: "method",
    paidAt: "paid_at",
  },
  requiredFields: ["bookingId", "userId", "provider", "amount"],
  defaultOrderBy: "created_at",
};
