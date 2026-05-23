module.exports = {
  tableName: "transaction_logs",
  primaryKey: "id",
  fields: {
    paymentId: "payment_id",
    bookingId: "booking_id",
    userId: "user_id",
    transactionType: "transaction_type",
    status: "status",
    amount: "amount",
    currency: "currency",
    providerReference: "provider_reference",
    requestPayload: "request_payload",
    responsePayload: "response_payload",
  },
  requiredFields: ["transactionType", "status"],
  jsonFields: ["request_payload", "response_payload"],
  defaultOrderBy: "created_at",
};
