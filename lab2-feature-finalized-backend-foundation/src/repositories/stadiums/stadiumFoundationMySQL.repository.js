const createBaseMySQLRepository = require("../common/baseMySQL.repository");
const stadiumModel = require("../../models/mysql/stadiums.model");

const stadiumFoundationMySQLRepository = createBaseMySQLRepository(stadiumModel);

module.exports = stadiumFoundationMySQLRepository;
