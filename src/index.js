require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");

const { corsOptions, configuredOrigins } = require("./config/cors.config");
const mysqlConnection = require("./connections/mysql.connection");
const mongodbConnection = require("./connections/mongodb.connection");
const ensureAuthSchema = require("./database/ensureAuthSchema");
const socketHub = require("./realtime/socketHub");
const { notFound, errorHandler } = require("./middleware/error.middleware");

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
const adminDataRoutes = require("./routes/adminData.routes");

const app = express();
const server = http.createServer(app);

const PORT = Number(process.env.PORT || 3000);

/* =========================
   SOCKET INIT
========================= */
socketHub.initialize(server);

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/* =========================
   MIDDLEWARES
========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const json = res.json.bind(res);

  res.json = (payload = {}) => {
    if (!payload || typeof payload !== "object" || Buffer.isBuffer(payload)) {
      return json({
        success: res.statusCode < 400,
        data: payload ?? null,
        error: res.statusCode < 400 ? null : "Request failed",
      });
    }

    const hasSuccess = typeof payload.success === "boolean";
    const success = hasSuccess ? payload.success : res.statusCode < 400;
    const error = payload.error ?? (success ? null : payload.message || "Request failed");
    const { success: _success, error: _error, message, ...rest } = payload;
    const hasData = Object.prototype.hasOwnProperty.call(payload, "data");
    const data = hasData
      ? payload.data
      : success
        ? (Object.keys(rest).length ? rest : message ? { message } : {})
        : null;

    return json({
      success,
      data: data === undefined ? (success ? {} : null) : data,
      error,
    });
  };

  next();
});

/* =========================
   ROUTES
========================= */
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
app.use("/api", adminDataRoutes);

app.use(notFound);
app.use(errorHandler);

/* =========================
   DB INIT
========================= */
const initializeDatabases = async () => {
  console.log("Initializing databases...");

  const mysqlOk = await mysqlConnection.testConnection();
  if (!mysqlOk) {
    console.warn("MySQL connection failed - continuing without MySQL");
  } else {
    try {
      await ensureAuthSchema();
      console.log("Auth schema ready");
    } catch (error) {
      console.warn("Auth schema check failed:", error.message);
    }
  }

  const mongoOk = await mongodbConnection.connect();
  if (!mongoOk) {
    console.warn("MongoDB connection failed - continuing without MongoDB");
  }

  console.log("Database initialization complete");
};

/* =========================
   START SERVER
========================= */
const listenWithFallback = (port, attempt = 0) => {
  return new Promise((resolve, reject) => {
    const onError = (error) => {
      server.off("listening", onListening);

      if (error.code === "EADDRINUSE" && process.env.NODE_ENV !== "production" && attempt < 10) {
        const nextPort = port + 1;
        console.warn("Port " + port + " is in use; trying " + nextPort);
        return resolve(listenWithFallback(nextPort, attempt + 1));
      }

      reject(error);
    };

    const onListening = () => {
      server.off("error", onError);
      resolve(port);
    };

    server.once("error", onError);
    server.listen(port, onListening);
  });
};

const startServer = async () => {
  await initializeDatabases();

  const activePort = await listenWithFallback(PORT);
  console.log("Server running on port " + activePort);
  console.log("Environment: " + (process.env.NODE_ENV || "development"));
  console.log("CORS allowed origins: " + configuredOrigins.join(", "));
};

startServer().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exit(1);
});

module.exports = { app, server };
