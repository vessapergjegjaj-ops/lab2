const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("../../utils/jwt.util");
const authMySQLRepository = require("../../repositories/auth/authMySQL.repository");
const refreshTokenMySQLRepository = require("../../repositories/refreshTokens/refreshTokenMySQL.repository");
const roleMySQLRepository = require("../../repositories/roles/roleMySQL.repository");
const userRoleMySQLService = require("../userRoles/userRoleMySQL.service");
const rbacMySQLService = require("../security/rbacMySQL.service");
const auditLogMySQLService = require("../auditLogs/auditLogMySQL.service");

const ACCESS_TOKEN_TTL_SECONDS = Number(process.env.ACCESS_TOKEN_TTL_SECONDS || 900);
const REFRESH_TOKEN_TTL_SECONDS = Number(process.env.REFRESH_TOKEN_TTL_SECONDS || 604800);
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "development-access-token-secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "development-refresh-token-secret";

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const newFamilyId = () => crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex");
const expiresAt = (seconds) => new Date(Date.now() + seconds * 1000);
const passwordPattern = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  const { password, password_hash, ...safeUser } = user;
  return safeUser;
};

const issueTokenPair = async (user, meta = {}, familyId = newFamilyId()) => {
  const accessToken = jwt.sign(
    { sub: user.id, email: user.email, type: "access" },
    ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_TTL_SECONDS
  );

  const refreshToken = jwt.sign(
    { sub: user.id, familyId, type: "refresh" },
    REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_TTL_SECONDS
  );

  const refreshRecord = await refreshTokenMySQLRepository.create({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    familyId,
    expiresAt: expiresAt(REFRESH_TOKEN_TTL_SECONDS),
    ipAddress: meta.ipAddress || null,
    userAgent: meta.userAgent || null,
  });

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresIn: ACCESS_TOKEN_TTL_SECONDS,
    refreshTokenExpiresIn: REFRESH_TOKEN_TTL_SECONDS,
    refreshRecord,
    user: sanitizeUser(user),
  };
};

const validateRegistration = (data = {}) => {
  if (!data.name || !data.email || !data.username || !data.password) {
    throw new Error("Name, email, username, and password are required");
  }

  if (!passwordPattern.test(data.password)) {
    throw new Error("Password must be at least 8 characters and include 1 uppercase letter and 1 special character");
  }
};

const getOrCreateDefaultUserRole = async () => {
  const existing = await roleMySQLRepository.findByName("user");
  if (existing) {
    return existing;
  }

  return await roleMySQLRepository.create({
    name: "user",
    description: "Default registered user role",
    isSystemRole: true,
  });
};

const authMySQLService = {
  async register(data, meta = {}) {
    validateRegistration(data);

    const duplicateEmail = await authMySQLRepository.findUserByEmail(data.email);
    if (duplicateEmail) {
      throw new Error("Email is already registered");
    }

    const duplicateUsername = await authMySQLRepository.findUserByUsername(data.username);
    if (duplicateUsername) {
      throw new Error("Username is already registered");
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await authMySQLRepository.createUser({
      name: data.name,
      username: data.username,
      email: data.email,
      passwordHash,
    });

    const defaultRole = await getOrCreateDefaultUserRole();
    await userRoleMySQLService.assignRole(user.id, defaultRole.id, {
      userId: user.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    await auditLogMySQLService.log("auth.register", "users", user.id, {
      userId: user.id,
      newValues: sanitizeUser(user),
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    const tokenPair = await issueTokenPair(user, meta);
    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      accessTokenExpiresIn: tokenPair.accessTokenExpiresIn,
      refreshTokenExpiresIn: tokenPair.refreshTokenExpiresIn,
      user: tokenPair.user,
    };
  },

  async login(credentials, meta = {}) {
    const identifier = credentials.identifier || credentials.email || credentials.username;
    const user = credentials.userId
      ? await authMySQLRepository.findUserById(credentials.userId)
      : await authMySQLRepository.findUserByEmailOrUsername(identifier);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    if (!user.password_hash || !(await bcrypt.compare(credentials.password || "", user.password_hash))) {
      throw new Error("Invalid credentials");
    }

    const tokenPair = await issueTokenPair(user, meta);
    await auditLogMySQLService.log("auth.login", "users", user.id, {
      userId: user.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      accessTokenExpiresIn: tokenPair.accessTokenExpiresIn,
      refreshTokenExpiresIn: tokenPair.refreshTokenExpiresIn,
      user: tokenPair.user,
    };
  },

  async refresh(refreshToken, meta = {}) {
    const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    if (payload.type !== "refresh") {
      throw new Error("Invalid refresh token");
    }

    const tokenRecord = await refreshTokenMySQLRepository.findByTokenHash(hashToken(refreshToken));
    if (!tokenRecord || tokenRecord.revoked_at || new Date(tokenRecord.expires_at) <= new Date()) {
      throw new Error("Refresh token is not active");
    }

    const user = await authMySQLRepository.findUserById(payload.sub);
    if (!user) {
      throw new Error("User not found");
    }

    const tokenPair = await issueTokenPair(user, meta, tokenRecord.family_id || payload.familyId);
    await refreshTokenMySQLRepository.revoke(tokenRecord.id, tokenPair.refreshRecord.id);
    await auditLogMySQLService.log("auth.refresh", "users", user.id, {
      userId: user.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      accessTokenExpiresIn: tokenPair.accessTokenExpiresIn,
      refreshTokenExpiresIn: tokenPair.refreshTokenExpiresIn,
      user: tokenPair.user,
    };
  },

  async logout(refreshToken, meta = {}) {
    const tokenRecord = await refreshTokenMySQLRepository.findByTokenHash(hashToken(refreshToken));
    if (!tokenRecord) {
      return false;
    }

    await refreshTokenMySQLRepository.revoke(tokenRecord.id);
    await auditLogMySQLService.log("auth.logout", "users", tokenRecord.user_id, {
      userId: tokenRecord.user_id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });
    return true;
  },

  async verifyAccessToken(accessToken) {
    const payload = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
    if (payload.type !== "access") {
      throw new Error("Invalid access token");
    }

    const user = await authMySQLRepository.findUserById(payload.sub);
    if (!user) {
      throw new Error("User not found");
    }

    const roles = await rbacMySQLService.getUserRoles(user.id);
    const permissions = await rbacMySQLService.getUserPermissions(user.id);
    return {
      ...sanitizeUser(user),
      roles,
      permissions,
    };
  },
};

module.exports = authMySQLService;
