require("dotenv").config();
const express = require("express");
const mysqlConnection = require("./connections/mysql.connection");
const mongodbConnection = require("./connections/mongodb.connection");
const exampleRoutes = require("./routes/example.routes");
const userRoutes = require("./routes/user.routes");
const ticketRoutes = require("./routes/ticket.routes");
const eventRoutes = require("./routes/event.routes");
const bookingRoutes = require("./routes/booking.routes");
const stadiumRoutes = require("./routes/stadium.routes");
const authRoutes = require("./routes/auth.routes");
const roleRoutes = require("./routes/role.routes");
const matchRoutes = require("./routes/match.routes");
const bookingExtensionRoutes = require("./routes/bookingExtension.routes");
const notificationRoutes = require("./routes/notification.routes");
const userFoundationRoutes = require("./routes/userFoundation.routes");
const stadiumFoundationRoutes = require("./routes/stadiumFoundation.routes");
const bookingFoundationRoutes = require("./routes/bookingFoundation.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  console.log("[REQUEST] " + req.method + " " + req.url + " Content-Type: " + req.headers["content-type"]);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log("[AFTER PARSE] " + req.method + " " + req.url + " Body: " + JSON.stringify(req.body));
  next();
});

app.use("/", exampleRoutes);
app.use("/api", userRoutes);
app.use("/api", ticketRoutes);
app.use("/api", eventRoutes);
app.use("/api", bookingRoutes);
app.use("/api", stadiumRoutes);
app.use("/api", authRoutes);
app.use("/api", roleRoutes);
app.use("/api", matchRoutes);
app.use("/api", bookingExtensionRoutes);
app.use("/api", notificationRoutes);
app.use("/api", userFoundationRoutes);
app.use("/api", stadiumFoundationRoutes);
app.use("/api", bookingFoundationRoutes);
app.use("/api", dashboardRoutes);

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
    console.log("Server running on port " + PORT);
    console.log("Environment: " + (process.env.NODE_ENV || "development"));
  });
};

startServer();

module.exports = app;
