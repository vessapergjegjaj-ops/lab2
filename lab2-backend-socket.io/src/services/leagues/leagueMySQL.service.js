const createBaseMySQLService = require("../common/baseMySQL.service");
const leagueMySQLRepository = require("../../repositories/leagues/leagueMySQL.repository");

const leagueMySQLService = {
  ...createBaseMySQLService(leagueMySQLRepository),

  async create(data) {
    const existing = await leagueMySQLRepository.findByName(data.name);
    if (existing) {
      throw new Error("League already exists");
    }

    return await leagueMySQLRepository.create(data);
  },
};

module.exports = leagueMySQLService;
