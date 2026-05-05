const stadiumMongoDBRepository = require('../../repositories/stadiums/stadiumMongoDB.repository');

const stadiumMongoDBService = {
  async getAllStadiums() {
    return await stadiumMongoDBRepository.findAll();
  },

  async getStadiumById(id) {
    return await stadiumMongoDBRepository.findById(id);
  },

  async createStadium(stadium) {
    if (!stadium.name || !stadium.capacity) {
      throw new Error('Name and capacity are required');
    }
    return await stadiumMongoDBRepository.create(stadium);
  },

  async updateStadium(id, stadium) {
    if (!stadium.name || !stadium.capacity) {
      throw new Error('Name and capacity are required');
    }
    return await stadiumMongoDBRepository.update(id, stadium);
  },

  async deleteStadium(id) {
    return await stadiumMongoDBRepository.delete(id);
  },

  async getSeatCategories(stadiumId) {
    const stadium = await stadiumMongoDBRepository.findById(stadiumId);
    return stadium ? stadium.seatCategories : null;
  },

  async addSeatCategory(stadiumId, category) {
    if (!category.categoryName) {
      throw new Error('Category name is required');
    }
    return await stadiumMongoDBRepository.addSeatCategory(stadiumId, category);
  },

  async removeSeatCategory(stadiumId, categoryId) {
    return await stadiumMongoDBRepository.removeSeatCategory(stadiumId, categoryId);
  },
};

module.exports = stadiumMongoDBService;