const createBaseMySQLRepository = require("../common/baseMySQL.repository");
const discountModel = require("../../models/mysql/discounts.model");

const discountMySQLRepository = createBaseMySQLRepository(discountModel);

discountMySQLRepository.findByCode = async (code) => {
  return await discountMySQLRepository.findOneBy("code", code);
};

module.exports = discountMySQLRepository;
