const userMongoDBRepository = require("../../repositories/users/userMongoDB.repository");

const userMongoDBService = {
  async getAllUsers() {
    return await userMongoDBRepository.findAll();
  },

  async getUserById(id) {
    return await userMongoDBRepository.findById(id);
  },

  async createUser(user) {
    if (!user.name || !user.email) {
      throw new Error("Name and email are required");
    }
    return await userMongoDBRepository.create(user);
  },

  async updateUser(id, user) {
    if (!user.name || !user.email) {
      throw new Error("Name and email are required");
    }
    return await userMongoDBRepository.update(id, user);
  },

  async deleteUser(id) {
    return await userMongoDBRepository.delete(id);
  },
};

module.exports = userMongoDBService;