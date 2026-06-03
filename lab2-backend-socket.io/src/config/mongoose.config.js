const mongoose = require("mongoose");

const mongoConfig = {
  uri: process.env.MONGODB_URI,
  options: {
    serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || 5000),
  },
};

module.exports = { mongoose, mongoConfig };
