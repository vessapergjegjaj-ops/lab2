const express = require('express');
const router = express.Router();
const ticketMySQLController = require('../controllers/tickets/ticketMySQL.controller');
const ticketMongoDBController = require('../controllers/tickets/ticketMongoDB.controller');

router.get('/mysql/tickets', ticketMySQLController.getAllTickets);
router.get('/mysql/tickets/:id', ticketMySQLController.getTicketById);
router.get('/mysql/tickets/event/:eventName', ticketMySQLController.getTicketsByEvent);
router.post('/mysql/tickets', ticketMySQLController.createTicket);
router.put('/mysql/tickets/:id', ticketMySQLController.updateTicket);
router.delete('/mysql/tickets/:id', ticketMySQLController.deleteTicket);

router.get('/mongodb/tickets', ticketMongoDBController.getAllTickets);
router.get('/mongodb/tickets/:id', ticketMongoDBController.getTicketById);
router.get('/mongodb/tickets/event/:eventName', ticketMongoDBController.getTicketsByEvent);
router.post('/mongodb/tickets', ticketMongoDBController.createTicket);
router.put('/mongodb/tickets/:id', ticketMongoDBController.updateTicket);
router.delete('/mongodb/tickets/:id', ticketMongoDBController.deleteTicket);

module.exports = router;
