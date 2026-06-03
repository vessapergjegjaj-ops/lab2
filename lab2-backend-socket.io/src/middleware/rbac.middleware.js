const rbacMySQLService = require("../services/security/rbacMySQL.service");

const requirePermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: "Authentication required" });
      }

      const allowed = await rbacMySQLService.userHasPermission(req.user.id, resource, action);
      if (!allowed) {
        return res.status(403).json({ success: false, error: "Permission denied" });
      }

      next();
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
};

module.exports = { requirePermission };
