const paymentMySQLService = require("../../services/payments/paymentMySQL.service");
const invoiceMySQLService = require("../../services/invoices/invoiceMySQL.service");
const transactionLogMySQLService = require("../../services/transactionLogs/transactionLogMySQL.service");
const seatReservationMySQLService = require("../../services/seatReservations/seatReservationMySQL.service");
const socketHub = require("../../realtime/socketHub");

const requestActor = (req) => ({
  userId: req.user ? req.user.id : null,
  roles: req.user ? req.user.roles || [] : [],
  ipAddress: req.ip,
  userAgent: req.headers["user-agent"],
});

const bookingExtensionMySQLController = {
  async getAllPayments(req, res) {
    try {
      const canReadAll = (req.user?.permissions || []).some((permission) => {
        return permission.resource === "payments" && permission.action === "read";
      });
      const payments = canReadAll
        ? await paymentMySQLService.getAll()
        : await paymentMySQLService.getByUserId(req.user.id);
      res.json({ success: true, data: payments });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getPayments(req, res) {
    try {
      const payments = await paymentMySQLService.getByBookingId(req.params.bookingId);
      res.json({ success: true, data: payments });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async createPayment(req, res) {
    try {
      const payment = await paymentMySQLService.create(
        { ...req.body, bookingId: req.params.bookingId, userId: req.user ? req.user.id : null },
        requestActor(req)
      );
      res.status(201).json({ success: true, data: payment });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async getInvoices(req, res) {
    try {
      const invoices = await invoiceMySQLService.getByBookingId(req.params.bookingId);
      res.json({ success: true, data: invoices });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async createInvoice(req, res) {
    try {
      const invoice = await invoiceMySQLService.create(
        { ...req.body, bookingId: req.params.bookingId },
        requestActor(req)
      );
      res.status(201).json({ success: true, data: invoice });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async getTransactionLogs(req, res) {
    try {
      const logs = await transactionLogMySQLService.getByBookingId(req.params.bookingId);
      res.json({ success: true, data: logs });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async createSeatReservation(req, res) {
    try {
      const reservation = await seatReservationMySQLService.reserve(
        { ...req.body, bookingId: req.params.bookingId },
        requestActor(req)
      );
      socketHub.emitDashboardUpdated({ reason: "seatReserved", reservation });
      res.status(201).json({ success: true, data: reservation });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },
};

module.exports = bookingExtensionMySQLController;
