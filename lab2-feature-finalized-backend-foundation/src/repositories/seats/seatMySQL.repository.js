const mysqlConnection = require("../../connections/mysql.connection");
const createBaseMySQLRepository = require("../common/baseMySQL.repository");
const seatModel = require("../../models/mysql/seats.model");

const seatMySQLRepository = createBaseMySQLRepository(seatModel);

seatMySQLRepository.findByStadiumId = async (stadiumId) => {
  const sql = `SELECT se.*, sc.category_name, sc.price_multiplier
               FROM seats se
               LEFT JOIN seat_categories sc ON sc.id = se.seat_category_id
               WHERE se.stadium_id = ?
               ORDER BY se.section, se.row_label, se.seat_number`;
  return await mysqlConnection.query(sql, [stadiumId]);
};

seatMySQLRepository.findAvailabilityByMatchId = async (matchId) => {
  const sql = `SELECT se.*,
                      sc.category_name,
                      sc.price_multiplier,
                      sr.status AS reservation_status,
                      sr.user_id AS reserved_by_user_id,
                      sr.hold_expires_at
               FROM matches m
               INNER JOIN seats se ON se.stadium_id = m.stadium_id
               LEFT JOIN seat_categories sc ON sc.id = se.seat_category_id
               LEFT JOIN seat_reservations sr
                 ON sr.match_id = m.id
                AND sr.seat_id = se.id
                AND sr.status IN ('held', 'reserved', 'booked')
               WHERE m.id = ?
               ORDER BY se.section, se.row_label, se.seat_number`;
  return await mysqlConnection.query(sql, [matchId]);
};

module.exports = seatMySQLRepository;
