const express = require("express");
const router = express.Router();
const notificationMySQLController = require("../controllers/notifications/notificationMySQL.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { requirePermission } = require("../middleware/rbac.middleware");

router.get("/mysql/notifications/me", authenticate, notificationMySQLController.getMyNotifications);
router.post("/mysql/notifications", authenticate, requirePermission("notifications", "create"), notificationMySQLController.createNotification);
router.put("/mysql/notifications/:id/read", authenticate, notificationMySQLController.markAsRead);
router.put("/mysql/notifications/read-all", authenticate, notificationMySQLController.markAllAsRead);

module.exports = router;
