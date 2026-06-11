const express = require("express");
const router = express.Router();
const userMySQLController = require("../controllers/users/userMySQL.controller");
const userMongoDBController = require("../controllers/users/userMongoDB.controller");

router.get("/mysql/users", userMySQLController.getAllUsers);
router.get("/mysql/users/:id", userMySQLController.getUserById);
router.post("/mysql/users", userMySQLController.createUser);
router.put("/mysql/users/:id", userMySQLController.updateUser);
router.delete("/mysql/users/:id", userMySQLController.deleteUser);

router.get("/mongodb/users", userMongoDBController.getAllUsers);
router.get("/mongodb/users/:id", userMongoDBController.getUserById);
router.post("/mongodb/users", userMongoDBController.createUser);
router.put("/mongodb/users/:id", userMongoDBController.updateUser);
router.delete("/mongodb/users/:id", userMongoDBController.deleteUser);

module.exports = router;