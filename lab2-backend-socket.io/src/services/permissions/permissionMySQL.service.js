const createBaseMySQLService = require("../common/baseMySQL.service");
const permissionMySQLRepository = require("../../repositories/permissions/permissionMySQL.repository");

const permissionMySQLService = {
  ...createBaseMySQLService(permissionMySQLRepository),

  async getByResourceAction(resource, action) {
    return await permissionMySQLRepository.findByResourceAction(resource, action);
  },
};

module.exports = permissionMySQLService;
