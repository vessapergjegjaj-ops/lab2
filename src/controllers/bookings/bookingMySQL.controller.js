const bookingMySQLService = require('../../services/bookings/bookingMySQL.service');
const { getRoleNames } = require("../../middleware/rbac.middleware");

const bookingMySQLController = {
  async getAllBookings(req, res) {
    try {
      const roles = getRoleNames(req.user || {});
      const bookings = roles.includes("admin")
        ? await bookingMySQLService.getAllBookings()
        : await bookingMySQLService.getBookingsByUserId(req.user.id);
      res.json({ success: true, data: bookings });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getBookingById(req, res) {
    try {
      const booking = await bookingMySQLService.getBookingById(req.params.id);
      if (!booking) {
        return res.status(404).json({ success: false, error: 'Booking not found' });
      }
      const roles = getRoleNames(req.user || {});
      if (!roles.includes("admin") && Number(booking.user_id || booking.userId) !== Number(req.user.id)) {
        return res.status(403).json({ success: false, error: "You can only view your own booking" });
      }
      res.json({ success: true, data: booking });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getBookingsByUserId(req, res) {
    try {
      const roles = getRoleNames(req.user || {});
      if (!roles.includes("admin") && Number(req.params.userId) !== Number(req.user.id)) {
        return res.status(403).json({ success: false, error: "You can only view your own bookings" });
      }
      const bookings = await bookingMySQLService.getBookingsByUserId(req.params.userId);
      res.json({ success: true, data: bookings });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async createBooking(req, res) {
    try {
      const booking = await bookingMySQLService.createBooking(req.body, {
        userId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });
      res.status(201).json({ success: true, data: booking });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async updateBooking(req, res) {
    try {
      const booking = await bookingMySQLService.updateBooking(req.params.id, req.body);
      if (!booking) {
        return res.status(404).json({ success: false, error: 'Booking not found' });
      }
      res.json({ success: true, data: booking });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async deleteBooking(req, res) {
    try {
      const deleted = await bookingMySQLService.deleteBooking(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Booking not found' });
      }
      res.json({ success: true, message: 'Booking deleted' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

module.exports = bookingMySQLController;
