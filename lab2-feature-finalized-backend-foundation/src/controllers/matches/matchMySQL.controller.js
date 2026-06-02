const matchMySQLService = require("../../services/matches/matchMySQL.service");
const seatMySQLService = require("../../services/seats/seatMySQL.service");
const seatReservationMySQLService = require("../../services/seatReservations/seatReservationMySQL.service");
const savedMatchMySQLService = require("../../services/savedMatches/savedMatchMySQL.service");

const requestActor = (req) => ({
  userId: req.user ? req.user.id : null,
  ipAddress: req.ip,
  userAgent: req.headers["user-agent"],
});

const matchMySQLController = {
  async getAllMatches(req, res) {
    try {
      const matches = await matchMySQLService.getAllDetailed();
      res.json({ success: true, data: matches });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getUpcomingMatches(req, res) {
    try {
      const matches = await matchMySQLService.getUpcoming(req.query.limit || 20);
      res.json({ success: true, data: matches });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getMatchById(req, res) {
    try {
      const match = await matchMySQLService.getDetailedById(req.params.id);
      if (!match) {
        return res.status(404).json({ success: false, error: "Match not found" });
      }
      res.json({ success: true, data: match });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async createMatch(req, res) {
    try {
      const match = await matchMySQLService.create(req.body, requestActor(req));
      res.status(201).json({ success: true, data: match });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async updateMatch(req, res) {
    try {
      const match = await matchMySQLService.update(req.params.id, req.body, requestActor(req));
      if (!match) {
        return res.status(404).json({ success: false, error: "Match not found" });
      }
      res.json({ success: true, data: match });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async deleteMatch(req, res) {
    try {
      const deleted = await matchMySQLService.delete(req.params.id, requestActor(req));
      if (!deleted) {
        return res.status(404).json({ success: false, error: "Match not found" });
      }
      res.json({ success: true, message: "Match deleted" });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getMatchSeats(req, res) {
    try {
      const seats = await seatMySQLService.getAvailabilityByMatchId(req.params.id);
      res.json({ success: true, data: seats });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async reserveSeat(req, res) {
    try {
      const reservation = await seatReservationMySQLService.reserve(
        { ...req.body, matchId: req.params.id, userId: req.user ? req.user.id : req.body.userId },
        requestActor(req)
      );
      res.status(201).json({ success: true, data: reservation });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async releaseReservation(req, res) {
    try {
      const reservation = await seatReservationMySQLService.release(req.params.reservationId, requestActor(req));
      res.json({ success: true, data: reservation });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async saveMatch(req, res) {
    try {
      const saved = await savedMatchMySQLService.save(req.user.id, req.params.id);
      res.status(201).json({ success: true, data: saved });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async unsaveMatch(req, res) {
    try {
      const removed = await savedMatchMySQLService.unsave(req.user.id, req.params.id);
      res.json({ success: true, data: { removed } });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async getSavedMatches(req, res) {
    try {
      const matches = await savedMatchMySQLService.getByUserId(req.user.id);
      res.json({ success: true, data: matches });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

module.exports = matchMySQLController;
