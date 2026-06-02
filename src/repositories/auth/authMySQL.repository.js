const userFoundationMySQLRepository = require("../users/userFoundationMySQL.repository");

const authMySQLRepository = {
  async findUserById(id) {
    return await userFoundationMySQLRepository.findById(id);
  },

  async findUserByEmail(email) {
    return await userFoundationMySQLRepository.findByEmail(email);
  },

  async findUserByUsername(username) {
    return await userFoundationMySQLRepository.findByUsername(username);
  },

  async findUserByEmailOrUsername(identifier) {
    return await userFoundationMySQLRepository.findByEmailOrUsername(identifier);
  },

  async createUser(user) {
    return await userFoundationMySQLRepository.create(user);
  },
};

module.exports = authMySQLRepository;
