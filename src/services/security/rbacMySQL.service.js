const rbacMySQLRepository = require("../../repositories/security/rbacMySQL.repository");

const rbacMySQLService = {
  async getUserRoles(userId) {
    return await rbacMySQLRepository.getUserRoles(userId);
  },

  async getUserPermissions(userId) {
    return await rbacMySQLRepository.getUserPermissions(userId);
  },

  async userHasPermission(userId, resource, action) {
    if (!userId) {
      return false;
    }

    return await rbacMySQLRepository.userHasPermission(userId, resource, action);
  },
};

module.exports = rbacMySQLService;
