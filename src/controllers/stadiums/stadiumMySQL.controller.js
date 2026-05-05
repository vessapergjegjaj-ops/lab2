const stadiumMySQLService = require('../../services/stadiums/stadiumMySQL.service');

const stadiumMySQLController = {
  async getAllStadiums(req, res) {
    try {
      const stadiums = await stadiumMySQLService.getAllStadiums();
      res.json({ success: true, data: stadiums });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getStadiumById(req, res) {
    try {
      const stadium = await stadiumMySQLService.getStadiumById(req.params.id);
      if (!stadium) {
        return res.status(404).json({ success: false, error: 'Stadium not found' });
      }
      res.json({ success: true, data: stadium });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async createStadium(req, res) {
    try {
      const stadium = await stadiumMySQLService.createStadium(req.body);
      res.status(201).json({ success: true, data: stadium });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async updateStadium(req, res) {
    try {
      const stadium = await stadiumMySQLService.updateStadium(req.params.id, req.body);
      if (!stadium) {
        return res.status(404).json({ success: false, error: 'Stadium not found' });
      }
      res.json({ success: true, data: stadium });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async deleteStadium(req, res) {
    try {
      const deleted = await stadiumMySQLService.deleteStadium(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Stadium not found' });
      }
      res.json({ success: true, message: 'Stadium deleted' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getSeatCategories(req, res) {
    try {
      const categories = await stadiumMySQLService.getSeatCategories(req.params.id);
      res.json({ success: true, data: categories });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async addSeatCategory(req, res) {
    try {
      const category = await stadiumMySQLService.addSeatCategory(req.params.id, req.body);
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async removeSeatCategory(req, res) {
    try {
      const deleted = await stadiumMySQLService.removeSeatCategory(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Seat category not found' });
      }
      res.json({ success: true, message: 'Seat category deleted' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

module.exports = stadiumMySQLController;