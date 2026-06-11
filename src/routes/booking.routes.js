const express = require('express');
const router = express.Router();
const bookingMySQLController = require('../controllers/bookings/bookingMySQL.controller');
const bookingMongoDBController = require('../controllers/bookings/bookingMongoDB.controller');
const { authenticate } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/rbac.middleware");

router.get('/mysql/bookings', authenticate, bookingMySQLController.getAllBookings);
router.get('/mysql/bookings/:id', authenticate, bookingMySQLController.getBookingById);
router.get('/mysql/bookings/user/:userId', authenticate, bookingMySQLController.getBookingsByUserId);
router.post('/mysql/bookings', authenticate, bookingMySQLController.createBooking);
router.put('/mysql/bookings/:id', authenticate, requireRole("admin"), bookingMySQLController.updateBooking);
router.delete('/mysql/bookings/:id', authenticate, requireRole("admin"), bookingMySQLController.deleteBooking);

router.get('/mongodb/bookings', bookingMongoDBController.getAllBookings);
router.get('/mongodb/bookings/:id', bookingMongoDBController.getBookingById);
router.get('/mongodb/bookings/user/:userId', bookingMongoDBController.getBookingsByUserId);
router.post('/mongodb/bookings', bookingMongoDBController.createBooking);
router.put('/mongodb/bookings/:id', bookingMongoDBController.updateBooking);
router.delete('/mongodb/bookings/:id', bookingMongoDBController.deleteBooking);

module.exports = router;
