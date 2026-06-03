const mysqlConnection = require('../../connections/mysql.connection');

const eventMySQLRepository = {
  async findAll() {
    const sql = 'SELECT * FROM events ORDER BY event_date DESC';
    return await mysqlConnection.query(sql);
  },

  async findById(id) {
    const sql = 'SELECT * FROM events WHERE id = ?';
    const results = await mysqlConnection.query(sql, [id]);
    return results[0] || null;
  },

  async findByDate(date) {
    const sql = 'SELECT * FROM events WHERE DATE(event_date) = DATE(?)';
    return await mysqlConnection.query(sql, [date]);
  },

  async create(event) {
    const sql = 'INSERT INTO events (name, description, event_date, stadium_location) VALUES (?, ?, ?, ?)';
    const result = await mysqlConnection.query(sql, [
      event.name,
      event.description || null,
      event.eventDate,
      event.stadiumLocation || null
    ]);
    return { id: result.insertId, ...event };
  },

  async update(id, event) {
    const sql = 'UPDATE events SET name = ?, description = ?, event_date = ?, stadium_location = ? WHERE id = ?';
    await mysqlConnection.query(sql, [
      event.name,
      event.description || null,
      event.eventDate,
      event.stadiumLocation || null,
      id
    ]);
    return await this.findById(id);
  },

  async delete(id) {
    const sql = 'DELETE FROM events WHERE id = ?';
    const result = await mysqlConnection.query(sql, [id]);
    return result.affectedRows > 0;
  },
};

module.exports = eventMySQLRepository;