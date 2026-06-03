const createBaseMySQLRepository = require("../common/baseMySQL.repository");
const mysqlConnection = require("../../connections/mysql.connection");
const invoiceModel = require("../../models/mysql/invoices.model");

const invoiceMySQLRepository = createBaseMySQLRepository(invoiceModel);

invoiceMySQLRepository.findByBookingId = async (bookingId) => {
  const sql = `SELECT i.*
               FROM invoices i
               INNER JOIN payments p ON p.id = i.payment_id
               WHERE p.booking_id = ?
               ORDER BY i.id DESC`;
  return await mysqlConnection.query(sql, [bookingId]);
};

invoiceMySQLRepository.findByPaymentId = async (paymentId) => {
  return await invoiceMySQLRepository.findBy("paymentId", paymentId);
};

module.exports = invoiceMySQLRepository;
