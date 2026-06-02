const createBaseMySQLService = require("../common/baseMySQL.service");
const savedMatchMySQLRepository = require("../../repositories/savedMatches/savedMatchMySQL.repository");
const matchMySQLRepository = require("../../repositories/matches/matchMySQL.repository");

const savedMatchMySQLService = {
  ...createBaseMySQLService(savedMatchMySQLRepository),

  async save(userId, matchId) {
    const match = await matchMySQLRepository.findById(matchId);
    if (!match) {
      throw new Error("Match not found");
    }

    const existing = await savedMatchMySQLRepository.findByUserAndMatch(userId, matchId);
    if (existing) {
      return existing;
    }

    return await savedMatchMySQLRepository.create({ userId, matchId });
  },

  async unsave(userId, matchId) {
    return await savedMatchMySQLRepository.deleteByUserAndMatch(userId, matchId);
  },

  async getByUserId(userId) {
    return await savedMatchMySQLRepository.findByUserId(userId);
  },
};

module.exports = savedMatchMySQLService;
