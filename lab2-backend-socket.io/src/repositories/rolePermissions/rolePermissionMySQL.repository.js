const mysqlConnection = require("../../connections/mysql.connection");
const createBaseMySQLRepository = require("../common/baseMySQL.repository");
const rolePermissionModel = require("../../models/mysql/rolePermissions.model");

const rolePermissionMySQLRepository = createBaseMySQLRepository(rolePermissionModel);

rolePermissionMySQLRepository.findByRoleId = async (roleId) => {
  return await rolePermissionMySQLRepository.findBy("roleId", roleId);
};

rolePermissionMySQLRepository.findByPermissionId = async (permissionId) => {
  return await rolePermissionMySQLRepository.findBy("permissionId", permissionId);
};

rolePermissionMySQLRepository.deleteByRoleAndPermission = async (roleId, permissionId) => {
  const sql = "DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?";
  const result = await mysqlConnection.query(sql, [roleId, permissionId]);
  return result.affectedRows > 0;
};

module.exports = rolePermissionMySQLRepository;
