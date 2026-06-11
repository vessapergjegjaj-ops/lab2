const authMySQLService = require("../services/auth/authMySQL.service");

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const [scheme, value] = header.split(" ");
    const token = /^Bearer$/i.test(scheme || "") ? value : null;

    if (!token) {
      return res.status(401).json({ success: false, error: "Access token required" });
    }

    req.user = await authMySQLService.verifyAccessToken(token);
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: error.message || "Invalid access token" });
  }
};

module.exports = { authenticate };
