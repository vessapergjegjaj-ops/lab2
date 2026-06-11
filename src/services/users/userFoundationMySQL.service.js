const createBaseMySQLService = require("../common/baseMySQL.service");
const userFoundationMySQLRepository = require("../../repositories/users/userFoundationMySQL.repository");
const auditLogMySQLService = require("../auditLogs/auditLogMySQL.service");

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  const { password_hash, passwordHash, ...safeUser } = user;
  return safeUser;
};

const userFoundationMySQLService = {
  ...createBaseMySQLService(userFoundationMySQLRepository),

  async getAllUsers() {
    const users = await userFoundationMySQLRepository.findAll();
    return users.map(sanitizeUser);
  },

  async getUserById(id) {
    return sanitizeUser(await userFoundationMySQLRepository.findById(id));
  },

  async updateUser(id, data, actor = {}) {
    const existing = await userFoundationMySQLRepository.findById(id);
    if (!existing) {
      return null;
    }

    if (data.email) {
      const duplicateEmail = await userFoundationMySQLRepository.findByEmail(data.email);
      if (duplicateEmail && Number(duplicateEmail.id) !== Number(id)) {
        throw new Error("Email is already registered");
      }
    }

    if (data.username) {
      const duplicateUsername = await userFoundationMySQLRepository.findByUsername(data.username);
      if (duplicateUsername && Number(duplicateUsername.id) !== Number(id)) {
        throw new Error("Username is already registered");
      }
    }

    const updated = await userFoundationMySQLRepository.update(id, data);
    await auditLogMySQLService.log("user.updated", "users", id, {
      userId: actor.userId,
      oldValues: sanitizeUser(existing),
      newValues: sanitizeUser(updated),
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });
    return sanitizeUser(updated);
  },

  async deleteUser(id, actor = {}) {
    const existing = await userFoundationMySQLRepository.findById(id);
    const deleted = await userFoundationMySQLRepository.delete(id);
    if (deleted) {
      await auditLogMySQLService.log("user.deleted", "users", id, {
        userId: actor.userId,
        oldValues: sanitizeUser(existing),
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
      });
    }
    return deleted;
  },
};

module.exports = userFoundationMySQLService;
