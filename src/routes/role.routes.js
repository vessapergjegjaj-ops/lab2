const express = require("express");
const router = express.Router();
const roleMySQLController = require("../controllers/roles/roleMySQL.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { requirePermission } = require("../middleware/rbac.middleware");

router.get("/mysql/roles", authenticate, requirePermission("roles", "read"), roleMySQLController.getAllRoles);
router.get("/mysql/roles/:id", authenticate, requirePermission("roles", "read"), roleMySQLController.getRoleById);
router.post("/mysql/roles", authenticate, requirePermission("roles", "create"), roleMySQLController.createRole);
router.put("/mysql/roles/:id", authenticate, requirePermission("roles", "update"), roleMySQLController.updateRole);
router.delete("/mysql/roles/:id", authenticate, requirePermission("roles", "delete"), roleMySQLController.deleteRole);

router.get("/mysql/permissions", authenticate, requirePermission("permissions", "read"), roleMySQLController.getAllPermissions);
router.post("/mysql/permissions", authenticate, requirePermission("permissions", "create"), roleMySQLController.createPermission);
router.get("/mysql/roles/:id/permissions", authenticate, requirePermission("roles", "read"), roleMySQLController.getRolePermissions);
router.post("/mysql/roles/:id/permissions", authenticate, requirePermission("roles", "update"), roleMySQLController.assignPermission);
router.delete("/mysql/roles/:id/permissions/:permissionId", authenticate, requirePermission("roles", "update"), roleMySQLController.removePermission);

router.get("/mysql/users/:userId/roles", authenticate, requirePermission("users", "read"), roleMySQLController.getUserRoles);
router.post("/mysql/users/:userId/roles", authenticate, requirePermission("users", "update"), roleMySQLController.assignUserRole);
router.delete("/mysql/users/:userId/roles/:roleId", authenticate, requirePermission("users", "update"), roleMySQLController.removeUserRole);

module.exports = router;
