const mysqlConnection = require("../../connections/mysql.connection");
const createBaseMySQLRepository = require("../common/baseMySQL.repository");
const savedMatchModel = require("../../models/mysql/savedMatches.model");

const savedMatchMySQLRepository = createBaseMySQLRepository(savedMatchModel);

savedMatchMySQLRepository.findByUserId = async (userId) => {
  const sql = `SELECT sm.*, m.kickoff_at, m.status, ht.name AS home_team_name, at.name AS away_team_name
               FROM saved_matches sm
               INNER JOIN matches m ON m.id = sm.match_id
               INNER JOIN teams ht ON ht.id = m.home_team_id
               INNER JOIN teams at ON at.id = m.away_team_id
               WHERE sm.user_id = ?
               ORDER BY m.kickoff_at ASC`;
  return await mysqlConnection.query(sql, [userId]);
};

savedMatchMySQLRepository.findByUserAndMatch = async (userId, matchId) => {
  const sql = "SELECT * FROM saved_matches WHERE user_id = ? AND match_id = ? LIMIT 1";
  const results = await mysqlConnection.query(sql, [userId, matchId]);
  return results[0] || null;
};

savedMatchMySQLRepository.deleteByUserAndMatch = async (userId, matchId) => {
  const sql = "DELETE FROM saved_matches WHERE user_id = ? AND match_id = ?";
  const result = await mysqlConnection.query(sql, [userId, matchId]);
  return result.affectedRows > 0;
};

module.exports = savedMatchMySQLRepository;
