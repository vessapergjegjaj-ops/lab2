const mysqlConnection = require("../../connections/mysql.connection");
const createBaseMySQLRepository = require("../common/baseMySQL.repository");
const notificationModel = require("../../models/mysql/notifications.model");

const notificationMySQLRepository = createBaseMySQLRepository(notificationModel);

notificationMySQLRepository.findByUserId = async (userId, options = {}) => {
  return await notificationMySQLRepository.findBy("userId", userId, {
    ...options,
    orderBy: "created_at",
    direction: "DESC",
  });
};

notificationMySQLRepository.markAsRead = async (id, userId) => {
  const sql = `UPDATE notifications
               SET status = 'read', read_at = CURRENT_TIMESTAMP
               WHERE id = ? AND user_id = ?`;
  await mysqlConnection.query(sql, [id, userId]);
  return await notificationMySQLRepository.findById(id);
};

notificationMySQLRepository.markAllAsRead = async (userId) => {
  const sql = `UPDATE notifications
               SET status = 'read', read_at = CURRENT_TIMESTAMP
               WHERE user_id = ? AND status != 'read'`;
  const result = await mysqlConnection.query(sql, [userId]);
  return result.affectedRows;
};

module.exports = notificationMySQLRepository;
