const stadiumFoundationMySQLService = require("../../services/stadiums/stadiumFoundationMySQL.service");

const requestActor = (req) => ({
  userId: req.user ? req.user.id : null,
  ipAddress: req.ip,
  userAgent: req.headers["user-agent"],
});

const stadiumFoundationMySQLController = {
  async getAllStadiums(req, res) {
    try {
      const stadiums = await stadiumFoundationMySQLService.getAllStadiums();
      res.json({ success: true, data: stadiums });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getStadiumById(req, res) {
    try {
      const stadium = await stadiumFoundationMySQLService.getStadiumById(req.params.id);
      if (!stadium) {
        return res.status(404).json({ success: false, error: "Stadium not found" });
      }
      res.json({ success: true, data: stadium });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async createStadium(req, res) {
    try {
      const stadium = await stadiumFoundationMySQLService.createStadium(req.body, requestActor(req));
      res.status(201).json({ success: true, data: stadium });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async updateStadium(req, res) {
    try {
      const stadium = await stadiumFoundationMySQLService.updateStadium(req.params.id, req.body, requestActor(req));
      if (!stadium) {
        return res.status(404).json({ success: false, error: "Stadium not found" });
      }
      res.json({ success: true, data: stadium });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },
};

module.exports = stadiumFoundationMySQLController;
