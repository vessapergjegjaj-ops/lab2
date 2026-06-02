const createBaseMySQLRepository = require("../common/baseMySQL.repository");
const transactionLogModel = require("../../models/mysql/transactionLogs.model");

const transactionLogMySQLRepository = createBaseMySQLRepository(transactionLogModel);

transactionLogMySQLRepository.findByPaymentId = async (paymentId) => {
  return await transactionLogMySQLRepository.findBy("paymentId", paymentId, {
    orderBy: "created_at",
    direction: "DESC",
  });
};

transactionLogMySQLRepository.findByBookingId = async (bookingId) => {
  return await transactionLogMySQLRepository.findBy("bookingId", bookingId, {
    orderBy: "created_at",
    direction: "DESC",
  });
};

module.exports = transactionLogMySQLRepository;
