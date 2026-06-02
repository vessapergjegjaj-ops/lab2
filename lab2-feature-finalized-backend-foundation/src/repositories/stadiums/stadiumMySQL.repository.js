const mysqlConnection = require('../../connections/mysql.connection');

const stadiumMySQLRepository = {
  async findAll() {
    const sql = 'SELECT * FROM stadiums ORDER BY name';
    return await mysqlConnection.query(sql);
  },

  async findById(id) {
    const sql = 'SELECT * FROM stadiums WHERE id = ?';
    const results = await mysqlConnection.query(sql, [id]);
    return results[0] || null;
  },

  async create(stadium) {
    const sql = 'INSERT INTO stadiums (name, location, capacity) VALUES (?, ?, ?)';
    const result = await mysqlConnection.query(sql, [
      stadium.name,
      stadium.location || null,
      stadium.capacity
    ]);
    return { id: result.insertId, ...stadium };
  },

  async update(id, stadium) {
    const sql = 'UPDATE stadiums SET name = ?, location = ?, capacity = ? WHERE id = ?';
    await mysqlConnection.query(sql, [
      stadium.name,
      stadium.location || null,
      stadium.capacity,
      id
    ]);
    return await this.findById(id);
  },

  async delete(id) {
    const sql = 'DELETE FROM stadiums WHERE id = ?';
    const result = await mysqlConnection.query(sql, [id]);
    return result.affectedRows > 0;
  },

  async getSeatCategories(stadiumId) {
    const sql = 'SELECT * FROM seat_categories WHERE stadium_id = ? ORDER BY category_name';
    return await mysqlConnection.query(sql, [stadiumId]);
  },

  async addSeatCategory(stadiumId, category) {
    const sql = 'INSERT INTO seat_categories (stadium_id, category_name, price_multiplier) VALUES (?, ?, ?)';
    const result = await mysqlConnection.query(sql, [
      stadiumId,
      category.categoryName,
      category.priceMultiplier || 1.0
    ]);
    return { id: result.insertId, stadium_id: stadiumId, ...category };
  },

  async deleteSeatCategory(id) {
    const sql = 'DELETE FROM seat_categories WHERE id = ?';
    const result = await mysqlConnection.query(sql, [id]);
    return result.affectedRows > 0;
  },
};

module.exports = stadiumMySQLRepository;