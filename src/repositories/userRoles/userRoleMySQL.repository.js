const mysqlConnection = require("../../connections/mysql.connection");
const createBaseMySQLRepository = require("../common/baseMySQL.repository");
const userRoleModel = require("../../models/mysql/userRoles.model");

const userRoleMySQLRepository = createBaseMySQLRepository(userRoleModel);

userRoleMySQLRepository.findByUserId = async (userId) => {
  const sql = `SELECT ur.*, r.name AS role_name, r.description AS role_description
               FROM user_roles ur
               INNER JOIN roles r ON r.id = ur.role_id
               WHERE ur.user_id = ?
               ORDER BY r.name`;
  return await mysqlConnection.query(sql, [userId]);
};

userRoleMySQLRepository.findByRoleId = async (roleId) => {
  return await userRoleMySQLRepository.findBy("roleId", roleId);
};

userRoleMySQLRepository.deleteByUserAndRole = async (userId, roleId) => {
  const sql = "DELETE FROM user_roles WHERE user_id = ? AND role_id = ?";
  const result = await mysqlConnection.query(sql, [userId, roleId]);
  return result.affectedRows > 0;
};

module.exports = userRoleMySQLRepository;
