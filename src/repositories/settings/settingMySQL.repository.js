const createBaseMySQLRepository = require("../common/baseMySQL.repository");
const settingModel = require("../../models/mysql/settings.model");

const settingMySQLRepository = createBaseMySQLRepository(settingModel);

settingMySQLRepository.findByKey = async (settingKey) => {
  return await settingMySQLRepository.findOneBy("settingKey", settingKey);
};

module.exports = settingMySQLRepository;
