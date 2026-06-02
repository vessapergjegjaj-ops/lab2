const createBaseMySQLRepository = require("../common/baseMySQL.repository");
const ticketModel = require("../../models/mysql/tickets.model");

const ticketFoundationMySQLRepository = createBaseMySQLRepository(ticketModel);

module.exports = ticketFoundationMySQLRepository;
