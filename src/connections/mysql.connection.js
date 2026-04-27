const { pool } = require("../config/db.config");

const mysqlConnection = {
  query: async (sql, params = []) => {
    const [results] = await pool.promise().execute(sql, params);
    return results;
  },

  testConnection: async () => {
    try {
      await pool.promise().query("SELECT 1");
      console.log("MySQL connected successfully");
      return true;
    } catch (error) {
      console.error("MySQL connection failed:", error.message);
      return false;
    }
  },
};

module.exports = mysqlConnection;