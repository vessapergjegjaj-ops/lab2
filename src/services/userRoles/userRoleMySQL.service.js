const createBaseMySQLService = require("../common/baseMySQL.service");
const userRoleMySQLRepository = require("../../repositories/userRoles/userRoleMySQL.repository");
const userFoundationMySQLRepository = require("../../repositories/users/userFoundationMySQL.repository");
const roleMySQLRepository = require("../../repositories/roles/roleMySQL.repository");
const auditLogMySQLService = require("../auditLogs/auditLogMySQL.service");

const userRoleMySQLService = {
  ...createBaseMySQLService(userRoleMySQLRepository),

  async assignRole(userId, roleId, actor = {}) {
    const user = await userFoundationMySQLRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const role = await roleMySQLRepository.findById(roleId);
    if (!role) {
      throw new Error("Role not found");
    }

    const created = await userRoleMySQLRepository.create({
      userId,
      roleId,
      assignedBy: actor.userId || null,
    });

    await auditLogMySQLService.log("user.role_assigned", "users", userId, {
      userId: actor.userId,
      newValues: { userId, roleId },
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });
    return created;
  },

  async removeRole(userId, roleId, actor = {}) {
    const removed = await userRoleMySQLRepository.deleteByUserAndRole(userId, roleId);
    await auditLogMySQLService.log("user.role_removed", "users", userId, {
      userId: actor.userId,
      oldValues: { userId, roleId },
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });
    return removed;
  },

  async getUserRoles(userId) {
    return await userRoleMySQLRepository.findByUserId(userId);
  },
};

module.exports = userRoleMySQLService;
