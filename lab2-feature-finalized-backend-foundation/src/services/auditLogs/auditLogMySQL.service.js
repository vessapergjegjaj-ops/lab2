const createBaseMySQLService = require("../common/baseMySQL.service");
const auditLogMySQLRepository = require("../../repositories/auditLogs/auditLogMySQL.repository");

const auditLogMySQLService = {
  ...createBaseMySQLService(auditLogMySQLRepository),

  async log(action, entityType, entityId, data = {}) {
    return await auditLogMySQLRepository.create({
      userId: data.userId || null,
      action,
      entityType,
      entityId: entityId === undefined || entityId === null ? null : String(entityId),
      oldValues: data.oldValues || null,
      newValues: data.newValues || null,
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
    });
  },

  async getByUserId(userId, options) {
    return await auditLogMySQLRepository.findByUserId(userId, options);
  },

  async getByEntity(entityType, entityId) {
    return await auditLogMySQLRepository.findByEntity(entityType, entityId);
  },
};

module.exports = auditLogMySQLService;
