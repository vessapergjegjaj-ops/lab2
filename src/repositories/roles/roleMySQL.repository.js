const mysqlConnection = require("../../connections/mysql.connection");
const createBaseMySQLRepository = require("../common/baseMySQL.repository");
const roleModel = require("../../models/mysql/roles.model");

const roleMySQLRepository = createBaseMySQLRepository(roleModel);

roleMySQLRepository.findByName = async (name) => {
  return await roleMySQLRepository.findOneBy("name", name);
};

roleMySQLRepository.findPermissions = async (roleId) => {
  const sql = `SELECT p.*
               FROM permissions p
               INNER JOIN role_permissions rp ON rp.permission_id = p.id
               WHERE rp.role_id = ?
               ORDER BY p.resource, p.action`;
  return await mysqlConnection.query(sql, [roleId]);
};

roleMySQLRepository.assignPermission = async (roleId, permissionId) => {
  const sql = `INSERT INTO role_permissions (role_id, permission_id)
               VALUES (?, ?)
               ON DUPLICATE KEY UPDATE permission_id = VALUES(permission_id)`;
  await mysqlConnection.query(sql, [roleId, permissionId]);
  return await roleMySQLRepository.findPermissions(roleId);
};

roleMySQLRepository.removePermission = async (roleId, permissionId) => {
  const sql = "DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?";
  const result = await mysqlConnection.query(sql, [roleId, permissionId]);
  return result.affectedRows > 0;
};

module.exports = roleMySQLRepository;
