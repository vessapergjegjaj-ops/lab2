const mysqlConnection = require("../../connections/mysql.connection");
const createBaseMySQLRepository = require("../common/baseMySQL.repository");
const refreshTokenModel = require("../../models/mysql/refreshTokens.model");

const refreshTokenMySQLRepository = createBaseMySQLRepository(refreshTokenModel);

refreshTokenMySQLRepository.findByTokenHash = async (tokenHash) => {
  return await refreshTokenMySQLRepository.findOneBy("tokenHash", tokenHash);
};

refreshTokenMySQLRepository.findActiveByUserId = async (userId) => {
  const sql = `SELECT *
               FROM refresh_tokens
               WHERE user_id = ?
                 AND revoked_at IS NULL
                 AND expires_at > CURRENT_TIMESTAMP
               ORDER BY issued_at DESC`;
  return await mysqlConnection.query(sql, [userId]);
};

refreshTokenMySQLRepository.revoke = async (id, replacedByTokenId = null) => {
  const sql = `UPDATE refresh_tokens
               SET revoked_at = CURRENT_TIMESTAMP, replaced_by_token_id = ?
               WHERE id = ?`;
  await mysqlConnection.query(sql, [replacedByTokenId, id]);
  return await refreshTokenMySQLRepository.findById(id);
};

refreshTokenMySQLRepository.revokeFamily = async (familyId) => {
  const sql = `UPDATE refresh_tokens
               SET revoked_at = CURRENT_TIMESTAMP
               WHERE family_id = ? AND revoked_at IS NULL`;
  const result = await mysqlConnection.query(sql, [familyId]);
  return result.affectedRows;
};

module.exports = refreshTokenMySQLRepository;
