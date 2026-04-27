const mongoose = require("mongoose");

const mongoConfig = {
  uri: process.env.MONGODB_URI,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
};

module.exports = { mongoose, mongoConfig };