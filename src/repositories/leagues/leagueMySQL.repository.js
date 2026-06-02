const createBaseMySQLRepository = require("../common/baseMySQL.repository");
const leagueModel = require("../../models/mysql/leagues.model");

const leagueMySQLRepository = createBaseMySQLRepository(leagueModel);

leagueMySQLRepository.findByName = async (name) => {
  return await leagueMySQLRepository.findOneBy("name", name);
};

module.exports = leagueMySQLRepository;
