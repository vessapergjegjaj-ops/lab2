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

const getRoleNames = (user = {}) => {
  const roles = Array.isArray(user.roles) ? user.roles : [];
  return roles
    .map((role) => String(role.name || role || "").toLowerCase())
    .concat(String(user.role || "").toLowerCase())
    .filter(Boolean);
};

const requireRole = (...allowedRoles) => {
  const allowed = allowedRoles.map((role) => String(role).toLowerCase());

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }

    const userRoles = getRoleNames(req.user);
    if (!allowed.some((role) => userRoles.includes(role))) {
      return res.status(403).json({ success: false, error: "Admin access required" });
    }

    next();
  };
};

module.exports = { requirePermission, requireRole, getRoleNames };
