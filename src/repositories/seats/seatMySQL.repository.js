const mysqlConnection = require("../../connections/mysql.connection");
const createBaseMySQLRepository = require("../common/baseMySQL.repository");
const seatModel = require("../../models/mysql/seats.model");

const seatMySQLRepository = createBaseMySQLRepository(seatModel);

seatMySQLRepository.findByStadiumId = async (stadiumId) => {
  const sql = `SELECT se.*,
                      NULL AS row_label,
                      'available' AS status,
                      NULL AS category_name,
                      1 AS price_multiplier,
                      se.price
               FROM seats se
               WHERE se.stadium_id = ?
               ORDER BY se.section, se.seat_number`;
  return await mysqlConnection.query(sql, [stadiumId]);
};

seatMySQLRepository.findAvailabilityByMatchId = async (matchId) => {
  const sql = `SELECT se.id,
                      se.stadium_id,
                      se.section,
                      NULL AS row_label,
                      se.seat_number,
                      COALESCE(sr.status, 'available') AS status,
                      NULL AS category_name,
                      1 AS price_multiplier,
                      COALESCE(se.price, m.base_ticket_price, 50) AS price,
                      sr.id AS reservation_id,
                      sr.status AS reservation_status,
                      sr.user_id AS reserved_by_user_id,
                      NULL AS hold_expires_at
               FROM matches m
               INNER JOIN seats se ON se.stadium_id = m.stadium_id
               LEFT JOIN seat_reservations sr
                 ON sr.match_id = m.id
                AND sr.seat_id = se.id
                AND sr.status IN ('held', 'reserved', 'booked')
               WHERE m.id = ?
               ORDER BY se.section, se.seat_number`;
  return await mysqlConnection.query(sql, [matchId]);
};

module.exports = seatMySQLRepository;
