const express = require("express");
const router = express.Router();
const dashboardMySQLController = require("../controllers/dashboard/dashboardMySQL.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.get("/mysql/dashboard/stats", authenticate, dashboardMySQLController.getStats);

module.exports = router;
