const authMySQLService = require("../../services/auth/authMySQL.service");

const requestMeta = (req) => ({
  ipAddress: req.ip,
  userAgent: req.headers["user-agent"],
});

const ok = (res, data, status = 200) => {
  return res.status(status).json({ success: true, data });
};

const fail = (res, status, error) => {
  return res.status(status).json({ success: false, error: error.message || String(error) });
};

const authMySQLController = {
  async register(req, res) {
    try {
      const session = await authMySQLService.register(req.body || {}, requestMeta(req));
      return ok(res, session, 201);
    } catch (error) {
      return fail(res, 400, error);
    }
  },

  async login(req, res) {
    try {
      const session = await authMySQLService.login(req.body || {}, requestMeta(req));
      return ok(res, session);
    } catch (error) {
      return fail(res, 401, error);
    }
  },

  async refresh(req, res) {
    try {
      const session = await authMySQLService.refresh((req.body || {}).refreshToken, requestMeta(req));
      return ok(res, session);
    } catch (error) {
      return fail(res, 401, error);
    }
  },

  async logout(req, res) {
    try {
      const loggedOut = await authMySQLService.logout((req.body || {}).refreshToken, requestMeta(req));
      return ok(res, { loggedOut });
    } catch (error) {
      return fail(res, 400, error);
    }
  },

  async me(req, res) {
    return ok(res, req.user);
  },
};

module.exports = authMySQLController;
