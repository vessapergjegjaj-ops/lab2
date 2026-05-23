const createBaseMySQLService = require("../common/baseMySQL.service");
const seatMySQLRepository = require("../../repositories/seats/seatMySQL.repository");
const stadiumFoundationMySQLRepository = require("../../repositories/stadiums/stadiumFoundationMySQL.repository");

const seatMySQLService = {
  ...createBaseMySQLService(seatMySQLRepository),

  async create(data) {
    const stadiumId = data.stadiumId || data.stadium_id;
    const stadium = await stadiumFoundationMySQLRepository.findById(stadiumId);
    if (!stadium) {
      throw new Error("Stadium not found");
    }

    return await seatMySQLRepository.create(data);
  },

  async getByStadiumId(stadiumId) {
    return await seatMySQLRepository.findByStadiumId(stadiumId);
  },

  async getAvailabilityByMatchId(matchId) {
    return await seatMySQLRepository.findAvailabilityByMatchId(matchId);
  },
};

module.exports = seatMySQLService;
