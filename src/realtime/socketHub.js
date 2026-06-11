const { Server } = require("socket.io");
const authMySQLService = require("../services/auth/authMySQL.service");
const { configuredOrigins } = require("../config/cors.config");

let ioInstance = null;

const roomForMatch = (matchId) => "match:" + matchId;
const roomForUser = (userId) => "user:" + userId;

const joinUserRoom = (socket, user) => {
  if (!user || !user.id) {
    return;
  }

  socket.join(roomForUser(user.id));
  const roleNames = (user.roles || []).map((role) => String(role.name || "").toLowerCase());
  if (roleNames.includes("admin")) {
    socket.join("admin:dashboard");
  }
};

const emitSeatAvailability = async (matchId, payload = {}) => {
  if (!ioInstance || !matchId) {
    return false;
  }

  const seatMySQLService = require("../services/seats/seatMySQL.service");
  const seats = await seatMySQLService.getAvailabilityByMatchId(matchId);
  ioInstance.to(roomForMatch(matchId)).emit("seatUpdated", {
    matchId,
    seats,
    ...payload,
  });
  return true;
};

const socketHub = {
  initialize(server) {
    if (ioInstance) {
      return ioInstance;
    }

    const io = new Server(server, {
      cors: {
        origin: configuredOrigins,
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
      },
    });

    io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth && socket.handshake.auth.token;
        if (token) {
          socket.user = await authMySQLService.verifyAccessToken(token);
        }
      } catch (error) {
        socket.user = null;
      }
      next();
    });

    io.on("connection", (socket) => {
      joinUserRoom(socket, socket.user);

      socket.on("joinMatch", (matchId, callback) => {
        socket.join(roomForMatch(matchId));
        if (typeof callback === "function") {
          callback({ success: true, matchId });
        }
      });

      socket.on("seatSelected", async (payload = {}, callback) => {
        try {
          if (!socket.user) {
            throw new Error("Login is required to reserve seats");
          }

          const seatReservationMySQLService = require("../services/seatReservations/seatReservationMySQL.service");
          const reservation = await seatReservationMySQLService.reserve(
            {
              matchId: payload.matchId,
              seatId: payload.seatId,
              userId: socket.user.id,
              status: payload.status || "held",
            },
            {
              userId: socket.user.id,
              ipAddress: socket.handshake.address,
              userAgent: socket.handshake.headers["user-agent"],
            }
          );

          io.to(roomForMatch(payload.matchId)).emit("seatSelected", {
            matchId: payload.matchId,
            seatId: payload.seatId,
            reservation,
          });
          if (typeof callback === "function") {
            callback({ success: true, reservation });
          }
        } catch (error) {
          if (typeof callback === "function") {
            callback({ success: false, error: error.message });
          }
        }
      });
    });

    ioInstance = io;
    return ioInstance;
  },

  attach(io) {
    ioInstance = io;
  },

  emitToUser(userId, eventName, payload) {
    if (!ioInstance || !userId) {
      return false;
    }

    ioInstance.to(roomForUser(userId)).emit(eventName, payload);
    return true;
  },

  emitToMatch(matchId, eventName, payload) {
    if (!ioInstance || !matchId) {
      return false;
    }

    ioInstance.to(roomForMatch(matchId)).emit(eventName, payload);
    return true;
  },

  async emitSeatAvailability(matchId, payload) {
    return await emitSeatAvailability(matchId, payload);
  },

  emitDashboardUpdated(payload = {}) {
    if (!ioInstance) {
      return false;
    }

    ioInstance.to("admin:dashboard").emit("dashboardUpdated", payload);
    ioInstance.emit("dashboardUpdated", payload);
    return true;
  },

  emit(eventName, payload) {
    if (!ioInstance) {
      return false;
    }

    ioInstance.emit(eventName, payload);
    return true;
  },

  isAttached() {
    return Boolean(ioInstance);
  },
};

module.exports = socketHub;
