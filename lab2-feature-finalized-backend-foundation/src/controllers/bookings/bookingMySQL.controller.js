const bookingMySQLService = require('../../services/bookings/bookingMySQL.service');

const bookingMySQLController = {
  async getAllBookings(req, res) {
    try {
      const bookings = await bookingMySQLService.getAllBookings();
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
      res.json({ success: true, data: booking });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getBookingsByUserId(req, res) {
    try {
      const bookings = await bookingMySQLService.getBookingsByUserId(req.params.userId);
      res.json({ success: true, data: bookings });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async createBooking(req, res) {
    try {
      const booking = await bookingMySQLService.createBooking(req.body);
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