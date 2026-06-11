module.exports = {
  tableName: "transaction_logs",
  primaryKey: "id",
  fields: {
    paymentId: "payment_id",
    transactionType: "transaction_type",
    status: "status",
  },
  requiredFields: ["transactionType", "status"],
  defaultOrderBy: "id",
};
