const dashboardMySQLService = require("../../services/dashboard/dashboardMySQL.service");

const dashboardMySQLController = {
  async getStats(req, res) {
    try {
      const stats = await dashboardMySQLService.getStats(req.user);
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

module.exports = dashboardMySQLController;
