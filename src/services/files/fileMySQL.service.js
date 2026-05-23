const createBaseMySQLService = require("../common/baseMySQL.service");
const fileMySQLRepository = require("../../repositories/files/fileMySQL.repository");

const fileMySQLService = {
  ...createBaseMySQLService(fileMySQLRepository),

  async getByRelatedEntity(relatedEntityType, relatedEntityId) {
    return await fileMySQLRepository.findByRelatedEntity(relatedEntityType, relatedEntityId);
  },
};

module.exports = fileMySQLService;
