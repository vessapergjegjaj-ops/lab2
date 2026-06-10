const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');

// GET route for exporting data
// Query params: resource, format, filename
// Example: GET /api/export?resource=bookings&format=csv
router.get('/export', exportController.exportResource);

// POST route for exporting with filters in body
// Body: { resource, format, filename, data }
router.post('/export', express.json({ limit: '5mb' }), exportController.exportResource);

module.exports = router;