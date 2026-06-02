const createBaseMySQLService = require("../common/baseMySQL.service");
const teamMySQLRepository = require("../../repositories/teams/teamMySQL.repository");
const leagueMySQLRepository = require("../../repositories/leagues/leagueMySQL.repository");

const teamMySQLService = {
  ...createBaseMySQLService(teamMySQLRepository),

  async create(data) {
    const leagueId = data.leagueId || data.league_id;
    if (leagueId) {
      const league = await leagueMySQLRepository.findById(leagueId);
      if (!league) {
        throw new Error("League not found");
      }
    }

    return await teamMySQLRepository.create(data);
  },

  async getByLeagueId(leagueId) {
    return await teamMySQLRepository.findByLeagueId(leagueId);
  },
};

module.exports = teamMySQLService;
