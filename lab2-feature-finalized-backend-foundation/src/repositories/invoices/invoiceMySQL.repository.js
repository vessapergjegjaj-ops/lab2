const createBaseMySQLRepository = require("../common/baseMySQL.repository");
const invoiceModel = require("../../models/mysql/invoices.model");

const invoiceMySQLRepository = createBaseMySQLRepository(invoiceModel);

invoiceMySQLRepository.findByBookingId = async (bookingId) => {
  return await invoiceMySQLRepository.findBy("bookingId", bookingId, {
    orderBy: "issued_at",
    direction: "DESC",
  });
};

invoiceMySQLRepository.findByPaymentId = async (paymentId) => {
  return await invoiceMySQLRepository.findBy("paymentId", paymentId);
};

module.exports = invoiceMySQLRepository;
