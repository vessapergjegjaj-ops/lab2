const express = require("express");
const router = express.Router();
const userFoundationMySQLController = require("../controllers/users/userFoundationMySQL.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { requirePermission } = require("../middleware/rbac.middleware");

router.get("/mysql/admin/users", authenticate, requirePermission("users", "read"), userFoundationMySQLController.getAllUsers);
router.get("/mysql/admin/users/:id", authenticate, requirePermission("users", "read"), userFoundationMySQLController.getUserById);
router.put("/mysql/admin/users/:id", authenticate, requirePermission("users", "update"), userFoundationMySQLController.updateUser);
router.delete("/mysql/admin/users/:id", authenticate, requirePermission("users", "delete"), userFoundationMySQLController.deleteUser);

module.exports = router;
