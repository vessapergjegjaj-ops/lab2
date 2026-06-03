module.exports = {
  tableName: "invoices",
  primaryKey: "id",
  fields: {
    paymentId: "payment_id",
    total: "total",
  },
  requiredFields: ["paymentId", "total"],
  defaultOrderBy: "id",
};
