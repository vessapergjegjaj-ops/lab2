require("dotenv").config();
const express = require("express");
const mysqlConnection = require("./connections/mysql.connection");
const mongodbConnection = require("./connections/mongodb.connection");
const exampleRoutes = require("./routes/example.routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", exampleRoutes);

const initializeDatabases = async () => {
  console.log("Initializing databases...");

  const mysqlOk = await mysqlConnection.testConnection();
  if (!mysqlOk) {
    console.warn("MySQL connection failed - continuing without MySQL");
  }

  const mongoOk = await mongodbConnection.connect();
  if (!mongoOk) {
    console.warn("MongoDB connection failed - continuing without MongoDB");
  }

  console.log("Database initialization complete");
};

const startServer = async () => {
  await initializeDatabases();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  });
};

startServer();

module.exports = app;