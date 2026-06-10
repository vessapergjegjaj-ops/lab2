const exportService = require('../services/exportService');

async function exportResource(req, res) {
    try {
        const format = (req.query.format || req.body.format || 'csv').toLowerCase();
        const filename = req.query.filename || req.body.filename || 'export';

        const validFormats = ['csv', 'xlsx', 'json'];
        if (!validFormats.includes(format)) {
            return res.status(400).json({ error: 'Invalid format' });
        }

        // 👉 TEST DATA (pa DB, pa error)
        let data = req.body.data || [
            { id: 1, name: "Test Booking", status: "active" },
            { id: 2, name: "Another Booking", status: "pending" }
        ];

        const plainData = data.map(item =>
            item.toObject ? item.toObject() : item
        );

        if (format === 'csv') {
            return exportService.exportCSV(res, plainData, `${filename}.csv`);
        }

        if (format === 'xlsx') {
            return await exportService.exportXLSX(res, plainData, `${filename}.xlsx`);
        }

        if (format === 'json') {
            return exportService.exportJSON(res, plainData, `${filename}.json`);
        }

    } catch (err) {
        return res.status(500).json({
            error: 'Export failed',
            details: err.message
        });
    }
}

module.exports = { exportResource };