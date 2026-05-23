const createBaseMySQLRepository = require("../common/baseMySQL.repository");
const userModel = require("../../models/mysql/users.model");

const userFoundationMySQLRepository = createBaseMySQLRepository(userModel);

userFoundationMySQLRepository.findByEmail = async (email) => {
  return await userFoundationMySQLRepository.findOneBy("email", email);
};

userFoundationMySQLRepository.findByUsername = async (username) => {
  if (!username) {
    return null;
  }

  return await userFoundationMySQLRepository.findOneBy("username", username);
};

userFoundationMySQLRepository.findByEmailOrUsername = async (identifier) => {
  const byEmail = await userFoundationMySQLRepository.findByEmail(identifier);
  if (byEmail) {
    return byEmail;
  }

  return await userFoundationMySQLRepository.findByUsername(identifier);
};

module.exports = userFoundationMySQLRepository;
