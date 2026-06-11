const createBaseMySQLService = require("../common/baseMySQL.service");
const notificationMySQLRepository = require("../../repositories/notifications/notificationMySQL.repository");
const socketHub = require("../../realtime/socketHub");

const normalizeNotification = (notification) => {
  if (!notification) {
    return notification;
  }

  return {
    ...notification,
    status: notification.status || "unread",
    is_read: (notification.status || "").toLowerCase() === "read",
  };
};

const notificationMySQLService = {
  ...createBaseMySQLService(notificationMySQLRepository),

  async createNotification(notification) {
    const created = await notificationMySQLRepository.create({
      ...notification,
      channel: notification.channel || "in_app",
      status: notification.status === "read" ? "read" : "unread",
    });
    const normalized = normalizeNotification(created);

    socketHub.emit("notificationCreated", normalized);
    socketHub.emitToUser(created.user_id || created.userId, "newNotification", normalized);
    return normalized;
  },

  async getByUserId(userId, options) {
    const notifications = await notificationMySQLRepository.findByUserId(userId, options);
    return notifications.map(normalizeNotification);
  },

  async markAsRead(id, userId) {
    const notification = await notificationMySQLRepository.markAsRead(id, userId);
    const normalized = normalizeNotification(notification);
    socketHub.emitToUser(userId, "notification.read", normalized);
    return normalized;
  },

  async markAllAsRead(userId) {
    const count = await notificationMySQLRepository.markAllAsRead(userId);
    socketHub.emitToUser(userId, "notification.readAll", { userId, count });
    return count;
  },
};

module.exports = notificationMySQLService;
