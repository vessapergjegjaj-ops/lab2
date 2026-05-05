const express = require('express');
const router = express.Router();
const bookingMySQLController = require('../controllers/bookings/bookingMySQL.controller');
const bookingMongoDBController = require('../controllers/bookings/bookingMongoDB.controller');

router.get('/mysql/bookings', bookingMySQLController.getAllBookings);
router.get('/mysql/bookings/:id', bookingMySQLController.getBookingById);
router.get('/mysql/bookings/user/:userId', bookingMySQLController.getBookingsByUserId);
router.post('/mysql/bookings', bookingMySQLController.createBooking);
router.put('/mysql/bookings/:id', bookingMySQLController.updateBooking);
router.delete('/mysql/bookings/:id', bookingMySQLController.deleteBooking);

router.get('/mongodb/bookings', bookingMongoDBController.getAllBookings);
router.get('/mongodb/bookings/:id', bookingMongoDBController.getBookingById);
router.get('/mongodb/bookings/user/:userId', bookingMongoDBController.getBookingsByUserId);
router.post('/mongodb/bookings', bookingMongoDBController.createBooking);
router.put('/mongodb/bookings/:id', bookingMongoDBController.updateBooking);
router.delete('/mongodb/bookings/:id', bookingMongoDBController.deleteBooking);

module.exports = router;
