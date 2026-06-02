const createBaseMySQLRepository = require("../common/baseMySQL.repository");
const paymentModel = require("../../models/mysql/payments.model");

const paymentMySQLRepository = createBaseMySQLRepository(paymentModel);

paymentMySQLRepository.findByBookingId = async (bookingId) => {
  return await paymentMySQLRepository.findBy("bookingId", bookingId, {
    orderBy: "created_at",
    direction: "DESC",
  });
};

paymentMySQLRepository.findByUserId = async (userId) => {
  return await paymentMySQLRepository.findBy("userId", userId, {
    orderBy: "created_at",
    direction: "DESC",
  });
};

module.exports = paymentMySQLRepository;
