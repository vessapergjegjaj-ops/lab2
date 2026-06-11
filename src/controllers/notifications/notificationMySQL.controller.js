const notificationMySQLService = require("../../services/notifications/notificationMySQL.service");

const notificationMySQLController = {
  async getMyNotifications(req, res) {
    try {
      const notifications = await notificationMySQLService.getByUserId(req.user.id);
      res.json({ success: true, data: notifications });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async createNotification(req, res) {
    try {
      const notification = await notificationMySQLService.createNotification(req.body);
      res.status(201).json({ success: true, data: notification });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async markAsRead(req, res) {
    try {
      const notification = await notificationMySQLService.markAsRead(req.params.id, req.user.id);
      res.json({ success: true, data: notification });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async markAllAsRead(req, res) {
    try {
      const count = await notificationMySQLService.markAllAsRead(req.user.id);
      res.json({ success: true, data: { count } });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },
};

module.exports = notificationMySQLController;
