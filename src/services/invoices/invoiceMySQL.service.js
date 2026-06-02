const createBaseMySQLService = require("../common/baseMySQL.service");
const invoiceMySQLRepository = require("../../repositories/invoices/invoiceMySQL.repository");
const paymentMySQLRepository = require("../../repositories/payments/paymentMySQL.repository");
const bookingFoundationMySQLRepository = require("../../repositories/bookings/bookingFoundationMySQL.repository");
const userFoundationMySQLRepository = require("../../repositories/users/userFoundationMySQL.repository");
const auditLogMySQLService = require("../auditLogs/auditLogMySQL.service");

const invoiceMySQLService = {
  ...createBaseMySQLService(invoiceMySQLRepository),

  async create(data, actor = {}) {
    const paymentId = data.paymentId || data.payment_id;
    const bookingId = data.bookingId || data.booking_id;
    const userId = data.userId || data.user_id;

    if (!(await paymentMySQLRepository.findById(paymentId))) {
      throw new Error("Payment not found");
    }

    if (!(await bookingFoundationMySQLRepository.findById(bookingId))) {
      throw new Error("Booking not found");
    }

    if (!(await userFoundationMySQLRepository.findById(userId))) {
      throw new Error("User not found");
    }

    const invoice = await invoiceMySQLRepository.create({
      ...data,
      invoiceNumber: data.invoiceNumber || data.invoice_number || "INV-" + Date.now(),
      taxAmount: data.taxAmount || data.tax_amount || 0,
      discountAmount: data.discountAmount || data.discount_amount || 0,
      status: data.status || "issued",
    });

    await auditLogMySQLService.log("invoice.created", "invoices", invoice.id, {
      userId: actor.userId || userId,
      newValues: invoice,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });
    return invoice;
  },

  async getByBookingId(bookingId) {
    return await invoiceMySQLRepository.findByBookingId(bookingId);
  },
};

module.exports = invoiceMySQLService;
