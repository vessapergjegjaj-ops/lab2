const stadiumMySQLRepository = require('../../repositories/stadiums/stadiumMySQL.repository');

const stadiumMySQLService = {
  async getAllStadiums() {
    return await stadiumMySQLRepository.findAll();
  },

  async getStadiumById(id) {
    return await stadiumMySQLRepository.findById(id);
  },

  async createStadium(stadium) {
    if (!stadium.name || !stadium.capacity) {
      throw new Error('Name and capacity are required');
    }
    return await stadiumMySQLRepository.create(stadium);
  },

  async updateStadium(id, stadium) {
    if (!stadium.name || !stadium.capacity) {
      throw new Error('Name and capacity are required');
    }
    return await stadiumMySQLRepository.update(id, stadium);
  },

  async deleteStadium(id) {
    return await stadiumMySQLRepository.delete(id);
  },

  async getSeatCategories(stadiumId) {
    return await stadiumMySQLRepository.getSeatCategories(stadiumId);
  },

  async addSeatCategory(stadiumId, category) {
    if (!category.categoryName) {
      throw new Error('Category name is required');
    }
    return await stadiumMySQLRepository.addSeatCategory(stadiumId, category);
  },

  async removeSeatCategory(categoryId) {
    return await stadiumMySQLRepository.deleteSeatCategory(categoryId);
  },
};

module.exports = stadiumMySQLService;