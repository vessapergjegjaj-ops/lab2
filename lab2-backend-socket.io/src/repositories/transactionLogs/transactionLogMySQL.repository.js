const createBaseMySQLRepository = require("../common/baseMySQL.repository");
const mysqlConnection = require("../../connections/mysql.connection");
const transactionLogModel = require("../../models/mysql/transactionLogs.model");

const transactionLogMySQLRepository = createBaseMySQLRepository(transactionLogModel);

transactionLogMySQLRepository.findByPaymentId = async (paymentId) => {
  return await transactionLogMySQLRepository.findBy("paymentId", paymentId, {
    orderBy: "id",
    direction: "DESC",
  });
};

transactionLogMySQLRepository.findByBookingId = async (bookingId) => {
  const sql = `SELECT tl.*
               FROM transaction_logs tl
               INNER JOIN payments p ON p.id = tl.payment_id
               WHERE p.booking_id = ?
               ORDER BY tl.id DESC`;
  return await mysqlConnection.query(sql, [bookingId]);
};

module.exports = transactionLogMySQLRepository;
