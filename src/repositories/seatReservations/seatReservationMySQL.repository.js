const mysqlConnection = require("../../connections/mysql.connection");
const createBaseMySQLRepository = require("../common/baseMySQL.repository");
const seatReservationModel = require("../../models/mysql/seatReservations.model");

const seatReservationMySQLRepository = createBaseMySQLRepository(seatReservationModel);

seatReservationMySQLRepository.findByMatchId = async (matchId) => {
  return await seatReservationMySQLRepository.findBy("matchId", matchId, {
    orderBy: "id",
    direction: "DESC",
  });
};

seatReservationMySQLRepository.findActiveByMatchSeat = async (matchId, seatId) => {
  const sql = `SELECT *
               FROM seat_reservations
               WHERE match_id = ?
                 AND seat_id = ?
                 AND status IN ('held', 'reserved', 'booked')
               LIMIT 1`;
  const results = await mysqlConnection.query(sql, [matchId, seatId]);
  return results[0] || null;
};

seatReservationMySQLRepository.release = async (id) => {
  const sql = `UPDATE seat_reservations
               SET status = 'released'
               WHERE id = ?`;
  await mysqlConnection.query(sql, [id]);
  return await seatReservationMySQLRepository.findById(id);
};

module.exports = seatReservationMySQLRepository;
