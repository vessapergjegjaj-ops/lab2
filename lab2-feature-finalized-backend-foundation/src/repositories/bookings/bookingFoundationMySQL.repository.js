const mysqlConnection = require("../../connections/mysql.connection");
const createBaseMySQLRepository = require("../common/baseMySQL.repository");
const bookingModel = require("../../models/mysql/bookings.model");

const bookingFoundationMySQLRepository = createBaseMySQLRepository(bookingModel);

bookingFoundationMySQLRepository.findDetailedAll = async () => {
  const sql = `SELECT b.*, u.name AS user_name, u.email AS user_email,
                      t.event_name, t.seat_number, t.price AS ticket_price
               FROM bookings b
               LEFT JOIN users u ON b.user_id = u.id
               LEFT JOIN tickets t ON b.ticket_id = t.id
               ORDER BY b.booking_date DESC`;
  return await mysqlConnection.query(sql);
};

bookingFoundationMySQLRepository.findDetailedById = async (id) => {
  const sql = `SELECT b.*, u.name AS user_name, u.email AS user_email,
                      t.event_name, t.seat_number, t.price AS ticket_price
               FROM bookings b
               LEFT JOIN users u ON b.user_id = u.id
               LEFT JOIN tickets t ON b.ticket_id = t.id
               WHERE b.id = ?`;
  const results = await mysqlConnection.query(sql, [id]);
  return results[0] || null;
};

bookingFoundationMySQLRepository.findDetailedByUserId = async (userId) => {
  const sql = `SELECT b.*, u.name AS user_name, u.email AS user_email,
                      t.event_name, t.seat_number, t.price AS ticket_price
               FROM bookings b
               LEFT JOIN users u ON b.user_id = u.id
               LEFT JOIN tickets t ON b.ticket_id = t.id
               WHERE b.user_id = ?
               ORDER BY b.booking_date DESC`;
  return await mysqlConnection.query(sql, [userId]);
};

bookingFoundationMySQLRepository.countActiveByUserId = async (userId) => {
  const sql = `SELECT COUNT(*) AS total
               FROM bookings
               WHERE user_id = ? AND status IN ('pending', 'confirmed')`;
  const results = await mysqlConnection.query(sql, [userId]);
  return results[0].total;
};

module.exports = bookingFoundationMySQLRepository;
