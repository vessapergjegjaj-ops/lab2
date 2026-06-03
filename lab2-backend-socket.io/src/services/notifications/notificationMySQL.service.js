const createBaseMySQLService = require("../common/baseMySQL.service");
const notificationMySQLRepository = require("../../repositories/notifications/notificationMySQL.repository");
const socketHub = require("../../realtime/socketHub");

const notificationMySQLService = {
  ...createBaseMySQLService(notificationMySQLRepository),

  async createNotification(notification) {
    const created = await notificationMySQLRepository.create({
      ...notification,
      channel: notification.channel || "in_app",
      status: notification.status || "pending",
    });

    socketHub.emit("notificationCreated", created);
    socketHub.emitToUser(created.user_id || created.userId, "newNotification", created);
    return created;
  },

  async getByUserId(userId, options) {
    return await notificationMySQLRepository.findByUserId(userId, options);
  },

  async markAsRead(id, userId) {
    const notification = await notificationMySQLRepository.markAsRead(id, userId);
    socketHub.emitToUser(userId, "notification.read", notification);
    return notification;
  },

  async markAllAsRead(userId) {
    const count = await notificationMySQLRepository.markAllAsRead(userId);
    socketHub.emitToUser(userId, "notification.readAll", { userId, count });
    return count;
  },
};

module.exports = notificationMySQLService;
