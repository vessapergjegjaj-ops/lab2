require("dotenv").config();
const mongoose = require("mongoose");

console.log(process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("CONNECTED OK"))
  .catch(err => console.log("ERROR:", err.message));