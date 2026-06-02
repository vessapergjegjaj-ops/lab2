const createBaseMySQLService = require("../common/baseMySQL.service");
const rolePermissionMySQLRepository = require("../../repositories/rolePermissions/rolePermissionMySQL.repository");

module.exports = createBaseMySQLService(rolePermissionMySQLRepository);
