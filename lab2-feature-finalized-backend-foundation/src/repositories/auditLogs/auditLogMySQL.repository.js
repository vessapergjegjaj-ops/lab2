const createBaseMySQLRepository = require("../common/baseMySQL.repository");
const auditLogModel = require("../../models/mysql/auditLogs.model");

const auditLogMySQLRepository = createBaseMySQLRepository(auditLogModel);

auditLogMySQLRepository.findByUserId = async (userId, options = {}) => {
  return await auditLogMySQLRepository.findBy("userId", userId, {
    ...options,
    orderBy: "created_at",
    direction: "DESC",
  });
};

auditLogMySQLRepository.findByEntity = async (entityType, entityId) => {
  return await auditLogMySQLRepository.findAll({
    where: { entityType, entityId },
    orderBy: "created_at",
    direction: "DESC",
  });
};

module.exports = auditLogMySQLRepository;
