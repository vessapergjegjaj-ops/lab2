const eventMySQLRepository = require('../../repositories/events/eventMySQL.repository');

const eventMySQLService = {
  async getAllEvents() {
    return await eventMySQLRepository.findAll();
  },

  async getEventById(id) {
    return await eventMySQLRepository.findById(id);
  },

  async getEventsByDate(date) {
    return await eventMySQLRepository.findByDate(date);
  },

  async createEvent(event) {
    if (!event.name || !event.eventDate) {
      throw new Error('Name and event date are required');
    }
    return await eventMySQLRepository.create(event);
  },

  async updateEvent(id, event) {
    if (!event.name || !event.eventDate) {
      throw new Error('Name and event date are required');
    }
    return await eventMySQLRepository.update(id, event);
  },

  async deleteEvent(id) {
    return await eventMySQLRepository.delete(id);
  },
};

module.exports = eventMySQLService;