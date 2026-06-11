const express = require("express");
const mongoose = require("mongoose");
const mysqlConnection = require("../connections/mysql.connection");
const mongodbConnection = require("../connections/mongodb.connection");

const router = express.Router();

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);

router.get("/mysql-test", async (req, res) => {
  try {
    const result = await mysqlConnection.query("SELECT NOW() as now");
    res.json({ success: true, mysqlTime: result[0].now });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/mongodb-test", async (req, res) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    res.json({
      success: true,
      mongodbStatus: isConnected ? "connected" : "disconnected",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/mongodb-user", async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = new User({ name, email });
    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/health", async (req, res) => {
  let mysqlStatus = "unavailable";

  try {
    await mysqlConnection.query("SELECT 1");
    mysqlStatus = "available";
  } catch (error) {
    mysqlStatus = "unavailable";
  }

  res.json({
    status: "ok",
    mysql: mysqlStatus,
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

module.exports = router;
