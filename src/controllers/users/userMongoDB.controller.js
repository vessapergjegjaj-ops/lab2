const userMongoDBService = require('../../services/users/userMongoDB.service');

const userMongoDBController = {
  async getAllUsers(req, res) {
    try {
      const users = await userMongoDBService.getAllUsers();
      res.json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getUserById(req, res) {
    try {
      const user = await userMongoDBService.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      res.json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async createUser(req, res) {
    try {
      const user = await userMongoDBService.createUser(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async updateUser(req, res) {
    try {
      const user = await userMongoDBService.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      res.json({ success: true, data: user });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async deleteUser(req, res) {
    try {
      const deleted = await userMongoDBService.deleteUser(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      res.json({ success: true, message: 'User deleted' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

module.exports = userMongoDBController;
