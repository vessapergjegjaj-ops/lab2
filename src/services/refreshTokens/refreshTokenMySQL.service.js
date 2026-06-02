const createBaseMySQLService = require("../common/baseMySQL.service");
const refreshTokenMySQLRepository = require("../../repositories/refreshTokens/refreshTokenMySQL.repository");

const refreshTokenMySQLService = {
  ...createBaseMySQLService(refreshTokenMySQLRepository),

  async revoke(id, replacedByTokenId) {
    return await refreshTokenMySQLRepository.revoke(id, replacedByTokenId);
  },

  async revokeFamily(familyId) {
    return await refreshTokenMySQLRepository.revokeFamily(familyId);
  },
};

module.exports = refreshTokenMySQLService;
