const userFoundationMySQLService = require("../../services/users/userFoundationMySQL.service");

const requestActor = (req) => ({
  userId: req.user ? req.user.id : null,
  ipAddress: req.ip,
  userAgent: req.headers["user-agent"],
});

const userFoundationMySQLController = {
  async getAllUsers(req, res) {
    try {
      const users = await userFoundationMySQLService.getAllUsers();
      res.json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getUserById(req, res) {
    try {
      const user = await userFoundationMySQLService.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }
      res.json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async updateUser(req, res) {
    try {
      const user = await userFoundationMySQLService.updateUser(req.params.id, req.body, requestActor(req));
      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }
      res.json({ success: true, data: user });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async deleteUser(req, res) {
    try {
      const deleted = await userFoundationMySQLService.deleteUser(req.params.id, requestActor(req));
      if (!deleted) {
        return res.status(404).json({ success: false, error: "User not found" });
      }
      res.json({ success: true, message: "User deleted" });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

module.exports = userFoundationMySQLController;
