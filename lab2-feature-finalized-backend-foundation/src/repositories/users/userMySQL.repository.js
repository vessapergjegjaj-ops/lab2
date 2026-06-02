const mysqlConnection = require('../../connections/mysql.connection');

const userMySQLRepository = {
  async findAll() {
    const sql = 'SELECT * FROM users';
    return await mysqlConnection.query(sql);
  },

  async findById(id) {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const results = await mysqlConnection.query(sql, [id]);
    return results[0] || null;
  },

  async create(user) {
    const sql = 'INSERT INTO users (name, email) VALUES (?, ?)';
    const result = await mysqlConnection.query(sql, [user.name, user.email]);
    return { id: result.insertId, ...user };
  },

  async update(id, user) {
    const sql = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
    await mysqlConnection.query(sql, [user.name, user.email, id]);
    return await this.findById(id);
  },

  async delete(id) {
    const sql = 'DELETE FROM users WHERE id = ?';
    const result = await mysqlConnection.query(sql, [id]);
    return result.affectedRows > 0;
  },
};

module.exports = userMySQLRepository;
