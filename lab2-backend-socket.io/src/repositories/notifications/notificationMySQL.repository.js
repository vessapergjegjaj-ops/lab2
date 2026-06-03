const mysqlConnection = require("../../connections/mysql.connection");
const createBaseMySQLRepository = require("../common/baseMySQL.repository");
const notificationModel = require("../../models/mysql/notifications.model");

const notificationMySQLRepository = createBaseMySQLRepository(notificationModel);

notificationMySQLRepository.findByUserId = async (userId, options = {}) => {
  try {
    return await notificationMySQLRepository.findBy("userId", userId, {
      ...options,
      orderBy: "id",
      direction: "DESC",
    });
  } catch (error) {
    if (error.code === "ER_NO_SUCH_TABLE") {
      return [];
    }
    throw error;
  }
};

notificationMySQLRepository.markAsRead = async (id, userId) => {
  const sql = `UPDATE notifications
               SET status = 'read', read_at = CURRENT_TIMESTAMP
               WHERE id = ? AND user_id = ?`;
  try {
    await mysqlConnection.query(sql, [id, userId]);
    return await notificationMySQLRepository.findById(id);
  } catch (error) {
    if (error.code === "ER_NO_SUCH_TABLE") {
      return null;
    }
    throw error;
  }
};

notificationMySQLRepository.markAllAsRead = async (userId) => {
  const sql = `UPDATE notifications
               SET status = 'read', read_at = CURRENT_TIMESTAMP
               WHERE user_id = ? AND status != 'read'`;
  try {
    const result = await mysqlConnection.query(sql, [userId]);
    return result.affectedRows;
  } catch (error) {
    if (error.code === "ER_NO_SUCH_TABLE") {
      return 0;
    }
    throw error;
  }
};

module.exports = notificationMySQLRepository;
