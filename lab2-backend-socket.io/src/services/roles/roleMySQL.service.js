const createBaseMySQLService = require("../common/baseMySQL.service");
const roleMySQLRepository = require("../../repositories/roles/roleMySQL.repository");
const permissionMySQLRepository = require("../../repositories/permissions/permissionMySQL.repository");
const auditLogMySQLService = require("../auditLogs/auditLogMySQL.service");

const roleMySQLService = {
  ...createBaseMySQLService(roleMySQLRepository),

  async create(data, actor = {}) {
    const existing = await roleMySQLRepository.findByName(data.name);
    if (existing) {
      throw new Error("Role already exists");
    }

    const role = await roleMySQLRepository.create(data);
    await auditLogMySQLService.log("role.created", "roles", role.id, {
      userId: actor.userId,
      newValues: role,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });
    return role;
  },

  async getPermissions(roleId) {
    const role = await roleMySQLRepository.findById(roleId);
    if (!role) {
      throw new Error("Role not found");
    }

    return await roleMySQLRepository.findPermissions(roleId);
  },

  async assignPermission(roleId, permissionId, actor = {}) {
    const role = await roleMySQLRepository.findById(roleId);
    if (!role) {
      throw new Error("Role not found");
    }

    const permission = await permissionMySQLRepository.findById(permissionId);
    if (!permission) {
      throw new Error("Permission not found");
    }

    const permissions = await roleMySQLRepository.assignPermission(roleId, permissionId);
    await auditLogMySQLService.log("role.permission_assigned", "roles", roleId, {
      userId: actor.userId,
      newValues: { roleId, permissionId },
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });
    return permissions;
  },

  async removePermission(roleId, permissionId, actor = {}) {
    const removed = await roleMySQLRepository.removePermission(roleId, permissionId);
    await auditLogMySQLService.log("role.permission_removed", "roles", roleId, {
      userId: actor.userId,
      oldValues: { roleId, permissionId },
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });
    return removed;
  },
};

module.exports = roleMySQLService;
