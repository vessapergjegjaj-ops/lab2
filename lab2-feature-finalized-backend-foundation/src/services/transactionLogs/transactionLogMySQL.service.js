const createBaseMySQLService = require("../common/baseMySQL.service");
const transactionLogMySQLRepository = require("../../repositories/transactionLogs/transactionLogMySQL.repository");

const transactionLogMySQLService = {
  ...createBaseMySQLService(transactionLogMySQLRepository),

  async getByPaymentId(paymentId) {
    return await transactionLogMySQLRepository.findByPaymentId(paymentId);
  },

  async getByBookingId(bookingId) {
    return await transactionLogMySQLRepository.findByBookingId(bookingId);
  },
};

module.exports = transactionLogMySQLService;
