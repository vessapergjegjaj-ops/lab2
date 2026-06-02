const express = require("express");
const router = express.Router();
const bookingExtensionMySQLController = require("../controllers/bookings/bookingExtensionMySQL.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { requirePermission } = require("../middleware/rbac.middleware");

router.get("/mysql/bookings/:bookingId/payments", authenticate, bookingExtensionMySQLController.getPayments);
router.post("/mysql/bookings/:bookingId/payments", authenticate, requirePermission("payments", "create"), bookingExtensionMySQLController.createPayment);
router.get("/mysql/bookings/:bookingId/invoices", authenticate, bookingExtensionMySQLController.getInvoices);
router.post("/mysql/bookings/:bookingId/invoices", authenticate, requirePermission("invoices", "create"), bookingExtensionMySQLController.createInvoice);
router.get("/mysql/bookings/:bookingId/transaction-logs", authenticate, requirePermission("payments", "read"), bookingExtensionMySQLController.getTransactionLogs);
router.post("/mysql/bookings/:bookingId/seat-reservations", authenticate, bookingExtensionMySQLController.createSeatReservation);

module.exports = router;
