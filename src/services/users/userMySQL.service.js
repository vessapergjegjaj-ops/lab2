const userMySQLRepository = require("../../repositories/users/userMySQL.repository");

const userMySQLService = {
  async getAllUsers() {
    return await userMySQLRepository.findAll();
  },

  async getUserById(id) {
    return await userMySQLRepository.findById(id);
  },

  async createUser(user) {
    if (!user.name || !user.email) {
      throw new Error("Name and email are required");
    }
    return await userMySQLRepository.create(user);
  },

  async updateUser(id, user) {
    if (!user.name || !user.email) {
      throw new Error("Name and email are required");
    }
    return await userMySQLRepository.update(id, user);
  },

  async deleteUser(id) {
    return await userMySQLRepository.delete(id);
  },
};

module.exports = userMySQLService;