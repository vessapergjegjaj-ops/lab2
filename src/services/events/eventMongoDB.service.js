const eventMongoDBRepository = require('../../repositories/events/eventMongoDB.repository');

const eventMongoDBService = {
  async getAllEvents() {
    return await eventMongoDBRepository.findAll();
  },

  async getEventById(id) {
    return await eventMongoDBRepository.findById(id);
  },

  async getEventsByDate(date) {
    return await eventMongoDBRepository.findByDate(date);
  },

  async createEvent(event) {
    if (!event.name || !event.eventDate) {
      throw new Error('Name and event date are required');
    }
    return await eventMongoDBRepository.create(event);
  },

  async updateEvent(id, event) {
    if (!event.name || !event.eventDate) {
      throw new Error('Name and event date are required');
    }
    return await eventMongoDBRepository.update(id, event);
  },

  async deleteEvent(id) {
    return await eventMongoDBRepository.delete(id);
  },
};

module.exports = eventMongoDBService;