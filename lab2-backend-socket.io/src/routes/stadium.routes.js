const express = require('express');
const router = express.Router();
const stadiumMySQLController = require('../controllers/stadiums/stadiumMySQL.controller');
const stadiumMongoDBController = require('../controllers/stadiums/stadiumMongoDB.controller');

router.get('/mysql/stadiums', stadiumMySQLController.getAllStadiums);
router.get('/mysql/stadiums/:id', stadiumMySQLController.getStadiumById);
router.post('/mysql/stadiums', stadiumMySQLController.createStadium);
router.put('/mysql/stadiums/:id', stadiumMySQLController.updateStadium);
router.delete('/mysql/stadiums/:id', stadiumMySQLController.deleteStadium);
router.get('/mysql/stadiums/:id/seats', stadiumMySQLController.getSeatCategories);
router.post('/mysql/stadiums/:id/seats', stadiumMySQLController.addSeatCategory);
router.delete('/mysql/stadiums/:id/seats/:categoryId', stadiumMySQLController.removeSeatCategory);

router.get('/mongodb/stadiums', stadiumMongoDBController.getAllStadiums);
router.get('/mongodb/stadiums/:id', stadiumMongoDBController.getStadiumById);
router.post('/mongodb/stadiums', stadiumMongoDBController.createStadium);
router.put('/mongodb/stadiums/:id', stadiumMongoDBController.updateStadium);
router.delete('/mongodb/stadiums/:id', stadiumMongoDBController.deleteStadium);
router.get('/mongodb/stadiums/:id/seats', stadiumMongoDBController.getSeatCategories);
router.post('/mongodb/stadiums/:id/seats', stadiumMongoDBController.addSeatCategory);
router.delete('/mongodb/stadiums/:stadiumId/seats/:categoryId', stadiumMongoDBController.removeSeatCategory);

module.exports = router;
