const createBaseMySQLRepository = require("../common/baseMySQL.repository");
const fileModel = require("../../models/mysql/files.model");

const fileMySQLRepository = createBaseMySQLRepository(fileModel);

fileMySQLRepository.findByRelatedEntity = async (relatedEntityType, relatedEntityId) => {
  return [];
};

module.exports = fileMySQLRepository;
