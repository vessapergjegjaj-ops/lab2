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
const passwordPattern = /^.{8,}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernamePattern = /^[a-zA-Z0-9_.-]{3,50}$/;

const normalizeString = (value) => String(value || "").trim();
const normalizeEmail = (value) => normalizeString(value).toLowerCase();
const normalizeUsername = (value) => normalizeString(value).toLowerCase();

const getPasswordHash = (user) => {
  return user && (user.passwordHash || user.password_hash || user.password);
};

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  const { password, passwordHash, password_hash, ...safeUser } = user;
  return {
    ...safeUser,
    role: safeUser.role || (Array.isArray(safeUser.roles) && safeUser.roles[0] ? safeUser.roles[0].name : undefined),
  };
};

const getUserRolesSafe = async (userId) => {
  try {
    return await rbacMySQLService.getUserRoles(userId);
  } catch (error) {
    console.warn("Unable to load user roles:", error.message);
    return [];
  }
};

const getUserPermissionsSafe = async (userId) => {
  try {
    return await rbacMySQLService.getUserPermissions(userId);
  } catch (error) {
    console.warn("Unable to load user permissions:", error.message);
    return [];
  }
};

const logAuthEvent = async (...args) => {
  try {
    await auditLogMySQLService.log(...args);
  } catch (error) {
    console.warn("Audit log failed:", error.message);
  }
};

const issueTokenPair = async (user, meta = {}, familyId = newFamilyId()) => {
  const roles = await getUserRolesSafe(user.id);
  const primaryRole = roles[0] ? roles[0].name : "user";
  const publicUser = sanitizeUser({ ...user, roles, role: primaryRole });

  const accessToken = jwt.sign(
    {
      sub: user.id,
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: primaryRole,
      roles: roles.map((role) => role.name),
      type: "access",
    },
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
    user: publicUser,
  };
};

const validateRegistration = (data = {}) => {
  const name = normalizeString(data.name);
  const username = normalizeUsername(data.username);
  const email = normalizeEmail(data.email);
  const password = String(data.password || "");

  if (!name || !username || !email || !password) {
    throw new Error("Name, username, email, and password are required");
  }

  if (!usernamePattern.test(username)) {
    throw new Error("Username must be 3-50 characters and can contain letters, numbers, dots, underscores, or hyphens");
  }

  if (!emailPattern.test(email)) {
    throw new Error("Email is invalid");
  }

  if (!passwordPattern.test(password)) {
    throw new Error("Password must be at least 8 characters");
  }

  return { name, username, email, password };
};

const validateLogin = (credentials = {}) => {
  const identifier = normalizeString(credentials.identifier || credentials.email || credentials.username);
  const password = String(credentials.password || "");

  if (!identifier || !password) {
    throw new Error("Email/username and password are required");
  }

  return { identifier, password };
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
    const normalized = validateRegistration(data);

    const duplicateEmail = await authMySQLRepository.findUserByEmail(normalized.email);
    if (duplicateEmail) {
      throw new Error("Email is already registered");
    }

    const duplicateUsername = await authMySQLRepository.findUserByUsername(normalized.username);
    if (duplicateUsername) {
      throw new Error("Username is already registered");
    }

    const passwordHash = await bcrypt.hash(normalized.password, 12);
    const user = await authMySQLRepository.createUser({
      name: normalized.name,
      username: normalized.username,
      email: normalized.email,
      passwordHash,
    });

    const defaultRole = await getOrCreateDefaultUserRole();
    await userRoleMySQLService.assignRole(user.id, defaultRole.id, {
      userId: user.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    await logAuthEvent("auth.register", "users", user.id, {
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
    const { identifier, password } = validateLogin(credentials);
    const user = credentials.userId
      ? await authMySQLRepository.findUserById(credentials.userId)
      : await authMySQLRepository.findUserByEmailOrUsername(identifier);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const passwordHash = getPasswordHash(user);
    if (!passwordHash || !(await bcrypt.compare(password, passwordHash))) {
      throw new Error("Invalid credentials");
    }

    const tokenPair = await issueTokenPair(user, meta);
    await logAuthEvent("auth.login", "users", user.id, {
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
    if (!refreshToken) {
      throw new Error("Refresh token is required");
    }

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
    await logAuthEvent("auth.refresh", "users", user.id, {
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
    if (!refreshToken) {
      return false;
    }

    const tokenRecord = await refreshTokenMySQLRepository.findByTokenHash(hashToken(refreshToken));
    if (!tokenRecord) {
      return false;
    }

    await refreshTokenMySQLRepository.revoke(tokenRecord.id);
    await logAuthEvent("auth.logout", "users", tokenRecord.user_id, {
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

    const roles = await getUserRolesSafe(user.id);
    const permissions = await getUserPermissionsSafe(user.id);
    return {
      ...sanitizeUser(user),
      role: roles[0] ? roles[0].name : "user",
      roles,
      permissions,
    };
  },
};

module.exports = authMySQLService;
