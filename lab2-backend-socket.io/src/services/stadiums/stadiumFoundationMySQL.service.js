const createBaseMySQLService = require("../common/baseMySQL.service");
const stadiumFoundationMySQLRepository = require("../../repositories/stadiums/stadiumFoundationMySQL.repository");
const auditLogMySQLService = require("../auditLogs/auditLogMySQL.service");

const stadiumFoundationMySQLService = {
  ...createBaseMySQLService(stadiumFoundationMySQLRepository),

  async createStadium(data, actor = {}) {
    if (!data.name || !data.capacity) {
      throw new Error("Name and capacity are required");
    }

    const stadium = await stadiumFoundationMySQLRepository.create(data);
    await auditLogMySQLService.log("stadium.created", "stadiums", stadium.id, {
      userId: actor.userId,
      newValues: stadium,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });
    return stadium;
  },

  async getAllStadiums() {
    return await stadiumFoundationMySQLRepository.findAll();
  },

  async getStadiumById(id) {
    return await stadiumFoundationMySQLRepository.findById(id);
  },

  async updateStadium(id, data, actor = {}) {
    const existing = await stadiumFoundationMySQLRepository.findById(id);
    if (!existing) {
      return null;
    }

    const updated = await stadiumFoundationMySQLRepository.update(id, data);
    await auditLogMySQLService.log("stadium.updated", "stadiums", id, {
      userId: actor.userId,
      oldValues: existing,
      newValues: updated,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });
    return updated;
  },
};

module.exports = stadiumFoundationMySQLService;
