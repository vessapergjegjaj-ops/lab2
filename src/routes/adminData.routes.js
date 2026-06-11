const express = require("express");
const router = express.Router();
const adminDataMySQLController = require("../controllers/adminDataMySQL.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/rbac.middleware");

const adminOnly = [authenticate, requireRole("admin")];

router.get("/mysql/search/:resource", adminOnly, adminDataMySQLController.search);
router.get("/mysql/reports", adminOnly, adminDataMySQLController.reports);
router.get("/mysql/export/:resource", adminOnly, adminDataMySQLController.export);
router.post("/mysql/import/:resource", adminOnly, adminDataMySQLController.import);

router.get("/search/:resource", adminOnly, adminDataMySQLController.search);
router.get("/reports", adminOnly, adminDataMySQLController.reports);
router.get("/export/:resource", adminOnly, adminDataMySQLController.export);
router.post("/import/:resource", adminOnly, adminDataMySQLController.import);

module.exports = router;
