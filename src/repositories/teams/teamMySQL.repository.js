const createBaseMySQLRepository = require("../common/baseMySQL.repository");
const teamModel = require("../../models/mysql/teams.model");

const teamMySQLRepository = createBaseMySQLRepository(teamModel);

teamMySQLRepository.findByLeagueId = async (leagueId) => {
  return await teamMySQLRepository.findBy("leagueId", leagueId, { orderBy: "name" });
};

teamMySQLRepository.findByName = async (name) => {
  return await teamMySQLRepository.findOneBy("name", name);
};

module.exports = teamMySQLRepository;
