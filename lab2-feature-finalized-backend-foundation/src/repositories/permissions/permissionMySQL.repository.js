const createBaseMySQLRepository = require("../common/baseMySQL.repository");
const permissionModel = require("../../models/mysql/permissions.model");

const permissionMySQLRepository = createBaseMySQLRepository(permissionModel);

permissionMySQLRepository.findByName = async (name) => {
  return await permissionMySQLRepository.findOneBy("name", name);
};

permissionMySQLRepository.findByResourceAction = async (resource, action) => {
  const permissions = await permissionMySQLRepository.findAll({
    where: { resource, action },
    limit: 1,
  });
  return permissions[0] || null;
};

module.exports = permissionMySQLRepository;
