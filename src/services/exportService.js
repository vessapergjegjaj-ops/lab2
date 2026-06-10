const ExcelJS = require('exceljs');
const { format } = require('@fast-csv/format');

/**
 * Normalize array of objects into headers and rows
 * Handles missing fields and converts Mongoose ObjectIds to strings
 * @param {Array<Object>} data
 * @returns {{headers: string[], rows: Array<Array<any>>}}
 */
function normalize(data) {
    if (!Array.isArray(data) || data.length === 0) {
        return { headers: [], rows: [] };
    }

    // Collect all unique keys from all objects
    const headersSet = new Set();
    data.forEach(item => {
        if (item && typeof item === 'object') {
            Object.keys(item).forEach(key => {
                // Skip internal Mongoose fields
                if (!key.startsWith('_') || key === '_id') {
                    headersSet.add(key);
                }
            });
        }
    });

    const headers = Array.from(headersSet).sort();

    // Convert each object to a row array
    const rows = data.map(item => {
        return headers.map(header => {
            if (!item || typeof item !== 'object') return null;
            
            const value = item[header];
            
            // Convert Mongoose ObjectId to string
            if (value && typeof value.toString === 'function' && value.constructor.name === 'ObjectId') {
                return value.toString();
            }
            
            // Convert dates to ISO string
            if (value instanceof Date) {
                return value.toISOString();
            }
            
            // Convert objects to JSON string
            if (typeof value === 'object' && value !== null) {
                return JSON.stringify(value);
            }
            
            return value ?? '';
        });
    });

    return { headers, rows };
}

/**
 * Export data to CSV format and stream to response
 * Uses fast-csv for efficient streaming
 * @param {Response} res - Express response object
 * @param {Array<Object>} data - Array of objects to export
 * @param {string} filename - Output filename (default: 'export.csv')
 */
function exportCSV(res, data, filename = 'export.csv') {
    try {
        if (!Array.isArray(data)) {
            return res.status(400).json({ error: 'Data must be an array' });
        }

        const { headers, rows } = normalize(data);

        if (headers.length === 0) {
            return res.status(400).json({ error: 'No data columns found' });
        }

        // Set response headers for file download
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Create CSV stream
        const csvStream = format({ headers });
        
        // Handle stream errors
        csvStream.on('error', (err) => {
            console.error('CSV stream error:', err);
            try {
                res.end();
            } catch (_) {
                // Response already ended
            }
        });

        // Pipe CSV stream to response
        csvStream.pipe(res);

        // Write header and rows
        csvStream.write(headers);
        rows.forEach(row => csvStream.write(row));
        csvStream.end();

        console.log(`CSV export created: ${filename} (${rows.length} rows)`);
    } catch (err) {
        console.error('exportCSV error:', err);
        if (!res.headersSent) {
            res.status(500).json({ 
                error: 'Failed to export CSV', 
                details: err.message 
            });
        }
    }
}

/**
 * Export data to Excel (.xlsx) format
 * Uses ExcelJS for XLSX file generation
 * @param {Response} res - Express response object
 * @param {Array<Object>} data - Array of objects to export
 * @param {string} filename - Output filename (default: 'export.xlsx')
 */
async function exportXLSX(res, data, filename = 'export.xlsx') {
    try {
        if (!Array.isArray(data)) {
            return res.status(400).json({ error: 'Data must be an array' });
        }

        const { headers, rows } = normalize(data);

        if (headers.length === 0) {
            return res.status(400).json({ error: 'No data columns found' });
        }

        // Create new workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');

        // Add header row with styling
        const headerRow = worksheet.addRow(headers);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };
        headerRow.alignment = { horizontal: 'center', vertical: 'center' };

        // Add data rows
        rows.forEach(row => {
            worksheet.addRow(row);
        });

        // Auto-fit column widths
        worksheet.columns.forEach(column => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
                const cellLength = cell.value ? cell.value.toString().length : 0;
                maxLength = Math.max(maxLength, cellLength);
            });
            column.width = Math.min(maxLength + 2, 50); // Max 50 chars
        });

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer();

        // Set response headers for file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', buffer.length);

        // Send file
        res.send(Buffer.from(buffer));

        console.log(`XLSX export created: ${filename} (${rows.length} rows)`);
    } catch (err) {
        console.error('exportXLSX error:', err);
        if (!res.headersSent) {
            res.status(500).json({ 
                error: 'Failed to export XLSX', 
                details: err.message 
            });
        }
    }
}

/**
 * Export data to JSON format
 * Streams prettified JSON to response
 * @param {Response} res - Express response object
 * @param {Array|Object} data - Data to export (array or object)
 * @param {string} filename - Output filename (default: 'export.json')
 */
function exportJSON(res, data, filename = 'export.json') {
    try {
        if (!data) {
            return res.status(400).json({ error: 'No data provided' });
        }

        // Convert Mongoose documents to plain objects
        let plainData = data;
        if (Array.isArray(data)) {
            plainData = data.map(item => 
                item.toObject ? item.toObject() : item
            );
        }

        // Stringify with pretty formatting
        const jsonString = JSON.stringify(plainData, null, 2);

        // Set response headers for file download
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', Buffer.byteLength(jsonString));

        // Send JSON file
        res.send(jsonString);

        console.log(`JSON export created: ${filename}`);
    } catch (err) {
        console.error('exportJSON error:', err);
        if (!res.headersSent) {
            res.status(500).json({ 
                error: 'Failed to export JSON', 
                details: err.message 
            });
        }
    }
}

module.exports = {
    exportCSV,
    exportXLSX,
    exportJSON,
    normalize
};