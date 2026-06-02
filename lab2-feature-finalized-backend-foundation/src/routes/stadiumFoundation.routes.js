const express = require("express");
const router = express.Router();
const stadiumFoundationMySQLController = require("../controllers/stadiums/stadiumFoundationMySQL.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { requirePermission } = require("../middleware/rbac.middleware");

router.get("/mysql/foundation/stadiums", stadiumFoundationMySQLController.getAllStadiums);
router.get("/mysql/foundation/stadiums/:id", stadiumFoundationMySQLController.getStadiumById);
router.post("/mysql/foundation/stadiums", authenticate, requirePermission("stadiums", "create"), stadiumFoundationMySQLController.createStadium);
router.put("/mysql/foundation/stadiums/:id", authenticate, requirePermission("stadiums", "update"), stadiumFoundationMySQLController.updateStadium);

module.exports = router;
