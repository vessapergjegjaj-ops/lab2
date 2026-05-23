const authMySQLService = require("../../services/auth/authMySQL.service");

const requestMeta = (req) => ({
  ipAddress: req.ip,
  userAgent: req.headers["user-agent"],
});

const authMySQLController = {
  async register(req, res) {
    try {
      const session = await authMySQLService.register(req.body, requestMeta(req));
      res.status(201).json({ success: true, data: session });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async login(req, res) {
    try {
      const session = await authMySQLService.login(req.body, requestMeta(req));
      res.json({ success: true, data: session });
    } catch (error) {
      res.status(401).json({ success: false, error: error.message });
    }
  },

  async refresh(req, res) {
    try {
      const session = await authMySQLService.refresh(req.body.refreshToken, requestMeta(req));
      res.json({ success: true, data: session });
    } catch (error) {
      res.status(401).json({ success: false, error: error.message });
    }
  },

  async logout(req, res) {
    try {
      const loggedOut = await authMySQLService.logout(req.body.refreshToken, requestMeta(req));
      res.json({ success: true, data: { loggedOut } });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async me(req, res) {
    res.json({ success: true, data: req.user });
  },
};

module.exports = authMySQLController;
