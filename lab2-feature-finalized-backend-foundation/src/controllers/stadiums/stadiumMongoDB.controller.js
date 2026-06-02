const stadiumMongoDBService = require('../../services/stadiums/stadiumMongoDB.service');

const stadiumMongoDBController = {
  async getAllStadiums(req, res) {
    try {
      const stadiums = await stadiumMongoDBService.getAllStadiums();
      res.json({ success: true, data: stadiums });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getStadiumById(req, res) {
    try {
      const stadium = await stadiumMongoDBService.getStadiumById(req.params.id);
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
      const stadium = await stadiumMongoDBService.createStadium(req.body);
      res.status(201).json({ success: true, data: stadium });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async updateStadium(req, res) {
    try {
      const stadium = await stadiumMongoDBService.updateStadium(req.params.id, req.body);
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
      const deleted = await stadiumMongoDBService.deleteStadium(req.params.id);
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
      const categories = await stadiumMongoDBService.getSeatCategories(req.params.id);
      if (!categories) {
        return res.status(404).json({ success: false, error: 'Stadium not found' });
      }
      res.json({ success: true, data: categories });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async addSeatCategory(req, res) {
    try {
      const stadium = await stadiumMongoDBService.addSeatCategory(req.params.id, req.body);
      if (!stadium) {
        return res.status(404).json({ success: false, error: 'Stadium not found' });
      }
      res.status(201).json({ success: true, data: stadium });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async removeSeatCategory(req, res) {
    try {
      const stadium = await stadiumMongoDBService.removeSeatCategory(req.params.stadiumId, req.params.categoryId);
      if (!stadium) {
        return res.status(404).json({ success: false, error: 'Stadium not found' });
      }
      res.json({ success: true, data: stadium });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

module.exports = stadiumMongoDBController;