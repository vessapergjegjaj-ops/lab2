const createBaseMySQLService = require("../common/baseMySQL.service");
const discountMySQLRepository = require("../../repositories/discounts/discountMySQL.repository");

const discountMySQLService = {
  ...createBaseMySQLService(discountMySQLRepository),

  async create(data) {
    const discountType = data.discountType || data.discount_type;
    const discountValue = Number(data.discountValue || data.discount_value);

    if (discountType === "percentage" && discountValue > 100) {
      throw new Error("Percentage discount cannot exceed 100");
    }

    return await discountMySQLRepository.create(data);
  },

  async getByCode(code) {
    return await discountMySQLRepository.findByCode(code);
  },
};

module.exports = discountMySQLService;
