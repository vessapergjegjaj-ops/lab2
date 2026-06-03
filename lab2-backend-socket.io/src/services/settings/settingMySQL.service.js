const createBaseMySQLService = require("../common/baseMySQL.service");
const settingMySQLRepository = require("../../repositories/settings/settingMySQL.repository");

const settingMySQLService = {
  ...createBaseMySQLService(settingMySQLRepository),

  async getByKey(settingKey) {
    return await settingMySQLRepository.findByKey(settingKey);
  },

  async upsertByKey(data) {
    const existing = await settingMySQLRepository.findByKey(data.settingKey || data.setting_key);
    if (existing) {
      return await settingMySQLRepository.update(existing.id, data);
    }

    return await settingMySQLRepository.create(data);
  },
};

module.exports = settingMySQLService;
