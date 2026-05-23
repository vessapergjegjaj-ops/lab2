const dashboardMySQLRepository = require("../../repositories/dashboard/dashboardMySQL.repository");

const isAdmin = (user) => {
  return Boolean((user.roles || []).find((role) => role.name === "admin"));
};

const dashboardMySQLService = {
  async getStats(user) {
    if (isAdmin(user)) {
      return {
        scope: "admin",
        ...(await dashboardMySQLRepository.getAdminStats()),
      };
    }

    return {
      scope: "user",
      ...(await dashboardMySQLRepository.getUserStats(user.id)),
    };
  },
};

module.exports = dashboardMySQLService;
