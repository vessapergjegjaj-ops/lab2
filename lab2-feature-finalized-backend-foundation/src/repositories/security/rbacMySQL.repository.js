const mysqlConnection = require("../../connections/mysql.connection");

const rbacMySQLRepository = {
  async getUserRoles(userId) {
    const sql = `SELECT r.*
                 FROM roles r
                 INNER JOIN user_roles ur ON ur.role_id = r.id
                 WHERE ur.user_id = ?
                 ORDER BY r.name`;
    return await mysqlConnection.query(sql, [userId]);
  },

  async getUserPermissions(userId) {
    const sql = `SELECT DISTINCT p.*
                 FROM permissions p
                 INNER JOIN role_permissions rp ON rp.permission_id = p.id
                 INNER JOIN user_roles ur ON ur.role_id = rp.role_id
                 WHERE ur.user_id = ?
                 ORDER BY p.resource, p.action`;
    return await mysqlConnection.query(sql, [userId]);
  },

  async userHasPermission(userId, resource, action) {
    const sql = `SELECT p.id
                 FROM permissions p
                 INNER JOIN role_permissions rp ON rp.permission_id = p.id
                 INNER JOIN user_roles ur ON ur.role_id = rp.role_id
                 WHERE ur.user_id = ?
                   AND (p.resource = ? OR p.resource = '*')
                   AND (p.action = ? OR p.action = '*')
                 LIMIT 1`;
    const results = await mysqlConnection.query(sql, [userId, resource, action]);
    return results.length > 0;
  },
};

module.exports = rbacMySQLRepository;
