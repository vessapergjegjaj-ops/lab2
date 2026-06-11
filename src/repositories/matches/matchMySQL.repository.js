const mysqlConnection = require("../../connections/mysql.connection");
const createBaseMySQLRepository = require("../common/baseMySQL.repository");
const matchModel = require("../../models/mysql/matches.model");

const matchMySQLRepository = createBaseMySQLRepository(matchModel);

matchMySQLRepository.findAllDetailed = async () => {
  const sql = `SELECT m.*,
                      l.name AS league_name,
                      s.name AS stadium_name,
                      s.location AS stadium_location,
                      ht.name AS home_team_name,
                      at.name AS away_team_name,
                      e.name AS event_name,
                      m.base_ticket_price
               FROM matches m
               LEFT JOIN leagues l ON l.id = m.league_id
               INNER JOIN stadiums s ON s.id = m.stadium_id
               INNER JOIN teams ht ON ht.id = m.home_team_id
               INNER JOIN teams at ON at.id = m.away_team_id
               LEFT JOIN events e ON e.id = m.event_id
               ORDER BY m.kickoff_at ASC`;
  return await mysqlConnection.query(sql);
};

matchMySQLRepository.findDetailedById = async (id) => {
  const sql = `SELECT m.*,
                      l.name AS league_name,
                      s.name AS stadium_name,
                      s.location AS stadium_location,
                      ht.name AS home_team_name,
                      at.name AS away_team_name,
                      e.name AS event_name,
                      m.base_ticket_price
               FROM matches m
               LEFT JOIN leagues l ON l.id = m.league_id
               INNER JOIN stadiums s ON s.id = m.stadium_id
               INNER JOIN teams ht ON ht.id = m.home_team_id
               INNER JOIN teams at ON at.id = m.away_team_id
               LEFT JOIN events e ON e.id = m.event_id
               WHERE m.id = ?`;
  const results = await mysqlConnection.query(sql, [id]);
  return results[0] || null;
};

matchMySQLRepository.findUpcoming = async (limit = 20) => {
  const sql = `SELECT *
               FROM matches
               WHERE kickoff_at >= CURRENT_TIMESTAMP
               ORDER BY kickoff_at ASC
               LIMIT ?`;
  return await mysqlConnection.query(sql, [Number(limit)]);
};

matchMySQLRepository.findByTeamId = async (teamId) => {
  const sql = `SELECT *
               FROM matches
               WHERE home_team_id = ? OR away_team_id = ?
               ORDER BY kickoff_at ASC`;
  return await mysqlConnection.query(sql, [teamId, teamId]);
};

module.exports = matchMySQLRepository;
