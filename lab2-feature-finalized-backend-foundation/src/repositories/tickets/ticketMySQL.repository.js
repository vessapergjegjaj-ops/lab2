const mysqlConnection = require('../../connections/mysql.connection');

const ticketMySQLRepository = {
  async findAll() {
    const sql = 'SELECT * FROM tickets';
    return await mysqlConnection.query(sql);
  },

  async findById(id) {
    const sql = 'SELECT * FROM tickets WHERE id = ?';
    const results = await mysqlConnection.query(sql, [id]);
    return results[0] || null;
  },

  async findByEvent(eventName) {
    const sql = 'SELECT * FROM tickets WHERE event_name = ?';
    return await mysqlConnection.query(sql, [eventName]);
  },

  async create(ticket) {
    const sql = 'INSERT INTO tickets (event_name, seat_number, price, status, user_id) VALUES (?, ?, ?, ?, ?)';
    const result = await mysqlConnection.query(sql, [
      ticket.eventName,
      ticket.seatNumber,
      ticket.price,
      ticket.status || 'available',
      ticket.userId || null
    ]);
    return { id: result.insertId, ...ticket };
  },

  async update(id, ticket) {
    const sql = 'UPDATE tickets SET event_name = ?, seat_number = ?, price = ?, status = ?, user_id = ? WHERE id = ?';
    await mysqlConnection.query(sql, [
      ticket.eventName,
      ticket.seatNumber,
      ticket.price,
      ticket.status,
      ticket.userId || null,
      id
    ]);
    return await this.findById(id);
  },

  async delete(id) {
    const sql = 'DELETE FROM tickets WHERE id = ?';
    const result = await mysqlConnection.query(sql, [id]);
    return result.affectedRows > 0;
  },
};

module.exports = ticketMySQLRepository;