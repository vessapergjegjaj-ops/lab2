const express = require('express');
const router = express.Router();
const eventMySQLController = require('../controllers/events/eventMySQL.controller');
const eventMongoDBController = require('../controllers/events/eventMongoDB.controller');

router.get('/mysql/events', eventMySQLController.getAllEvents);
router.get('/mysql/events/:id', eventMySQLController.getEventById);
router.get('/mysql/events/date/:date', eventMySQLController.getEventsByDate);
router.post('/mysql/events', eventMySQLController.createEvent);
router.put('/mysql/events/:id', eventMySQLController.updateEvent);
router.delete('/mysql/events/:id', eventMySQLController.deleteEvent);

router.get('/mongodb/events', eventMongoDBController.getAllEvents);
router.get('/mongodb/events/:id', eventMongoDBController.getEventById);
router.get('/mongodb/events/date/:date', eventMongoDBController.getEventsByDate);
router.post('/mongodb/events', eventMongoDBController.createEvent);
router.put('/mongodb/events/:id', eventMongoDBController.updateEvent);
router.delete('/mongodb/events/:id', eventMongoDBController.deleteEvent);

module.exports = router;
