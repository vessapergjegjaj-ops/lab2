const express = require("express");
const router = express.Router();
const authMySQLController = require("../controllers/auth/authMySQL.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.post("/mysql/auth/login", authMySQLController.login);
router.post("/mysql/auth/register", authMySQLController.register);
router.post("/mysql/auth/refresh", authMySQLController.refresh);
router.post("/mysql/auth/logout", authMySQLController.logout);
router.get("/mysql/auth/me", authenticate, authMySQLController.me);

module.exports = router;
