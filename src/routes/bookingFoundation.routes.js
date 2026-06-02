const express = require("express");
const router = express.Router();
const bookingFoundationMySQLController = require("../controllers/bookings/bookingFoundationMySQL.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { requirePermission } = require("../middleware/rbac.middleware");

router.get("/mysql/foundation/bookings", authenticate, requirePermission("bookings", "read"), bookingFoundationMySQLController.getAllBookings);
router.get("/mysql/foundation/bookings/me", authenticate, bookingFoundationMySQLController.getMyBookings);
router.get("/mysql/foundation/bookings/:id", authenticate, bookingFoundationMySQLController.getBookingById);
router.post("/mysql/foundation/bookings", authenticate, bookingFoundationMySQLController.createBooking);

module.exports = router;
