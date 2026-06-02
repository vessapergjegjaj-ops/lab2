module.exports = {
  tableName: "invoices",
  primaryKey: "id",
  fields: {
    invoiceNumber: "invoice_number",
    paymentId: "payment_id",
    bookingId: "booking_id",
    userId: "user_id",
    subtotal: "subtotal",
    taxAmount: "tax_amount",
    discountAmount: "discount_amount",
    total: "total",
    status: "status",
    issuedAt: "issued_at",
    dueAt: "due_at",
  },
  requiredFields: ["invoiceNumber", "paymentId", "bookingId", "userId", "subtotal", "total"],
  defaultOrderBy: "issued_at",
};
