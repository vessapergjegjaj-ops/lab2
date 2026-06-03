const createBaseMySQLService = require("../common/baseMySQL.service");
const seatMySQLRepository = require("../../repositories/seats/seatMySQL.repository");
const stadiumFoundationMySQLRepository = require("../../repositories/stadiums/stadiumFoundationMySQL.repository");

const normalizeAvailability = (seat) => {
  const reservationStatus = seat.reservation_status || seat.reservationStatus;
  const baseStatus = seat.status || "available";
  const status = reservationStatus || baseStatus || "available";
  const labelParts = [seat.section, seat.row_label || seat.rowLabel, seat.seat_number || seat.seatNumber].filter(Boolean);

  return {
    ...seat,
    status,
    reservationId: seat.reservation_id || seat.reservationId || null,
    reservedByUserId: seat.reserved_by_user_id || seat.reservedByUserId || null,
    label: seat.label || labelParts.join("-") || String(seat.id),
    price: seat.price !== undefined ? seat.price : seat.ticket_price,
  };
};

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
    const seats = await seatMySQLRepository.findAvailabilityByMatchId(matchId);
    return seats.map(normalizeAvailability);
  },
};

module.exports = seatMySQLService;
