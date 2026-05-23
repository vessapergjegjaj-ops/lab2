const bookingFoundationMySQLService = require("../../services/bookings/bookingFoundationMySQL.service");

const requestActor = (req) => ({
  userId: req.user ? req.user.id : null,
  ipAddress: req.ip,
  userAgent: req.headers["user-agent"],
});

const bookingFoundationMySQLController = {
  async getAllBookings(req, res) {
    try {
      const bookings = await bookingFoundationMySQLService.getAllBookings();
      res.json({ success: true, data: bookings });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getBookingById(req, res) {
    try {
      const booking = await bookingFoundationMySQLService.getBookingById(req.params.id);
      if (!booking) {
        return res.status(404).json({ success: false, error: "Booking not found" });
      }
      res.json({ success: true, data: booking });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getMyBookings(req, res) {
    try {
      const bookings = await bookingFoundationMySQLService.getBookingsByUserId(req.user.id);
      res.json({ success: true, data: bookings });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async createBooking(req, res) {
    try {
      const booking = await bookingFoundationMySQLService.createBooking(
        { ...req.body, userId: req.body.userId || (req.user ? req.user.id : null) },
        requestActor(req)
      );
      res.status(201).json({ success: true, data: booking });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },
};

module.exports = bookingFoundationMySQLController;

