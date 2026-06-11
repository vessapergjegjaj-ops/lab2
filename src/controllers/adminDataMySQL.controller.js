const adminDataMySQLService = require("../services/adminDataMySQL.service");

const parseRecords = (body = {}) => {
  if (Array.isArray(body)) {
    return body;
  }
  if (Array.isArray(body.records)) {
    return body.records;
  }
  throw new Error("records array is required");
};

const adminDataMySQLController = {
  async search(req, res) {
    try {
      const data = await adminDataMySQLService.search(req.params.resource, req.query || {});
      res.json({ success: true, data });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async reports(req, res) {
    try {
      const data = await adminDataMySQLService.reports(req.query || {});
      res.json({ success: true, data });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async export(req, res) {
    try {
      const format = String(req.query.format || "csv").toLowerCase();
      const exported = await adminDataMySQLService.export(req.params.resource, format, req.query || {});
      const filename = req.params.resource + "." + exported.extension;
      res.setHeader("Content-Type", exported.contentType);
      res.setHeader("Content-Disposition", 'attachment; filename="' + filename + '"');
      res.send(exported.body);
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async import(req, res) {
    try {
      const result = await adminDataMySQLService.import(req.params.resource, parseRecords(req.body));
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },
};

module.exports = adminDataMySQLController;
