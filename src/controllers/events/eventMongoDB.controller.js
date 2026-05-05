const eventMongoDBService = require('../../services/events/eventMongoDB.service');

const eventMongoDBController = {
  async getAllEvents(req, res) {
    try {
      const events = await eventMongoDBService.getAllEvents();
      res.json({ success: true, data: events });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getEventById(req, res) {
    try {
      const event = await eventMongoDBService.getEventById(req.params.id);
      if (!event) {
        return res.status(404).json({ success: false, error: 'Event not found' });
      }
      res.json({ success: true, data: event });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getEventsByDate(req, res) {
    try {
      const events = await eventMongoDBService.getEventsByDate(req.params.date);
      res.json({ success: true, data: events });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async createEvent(req, res) {
    try {
      const event = await eventMongoDBService.createEvent(req.body);
      res.status(201).json({ success: true, data: event });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async updateEvent(req, res) {
    try {
      const event = await eventMongoDBService.updateEvent(req.params.id, req.body);
      if (!event) {
        return res.status(404).json({ success: false, error: 'Event not found' });
      }
      res.json({ success: true, data: event });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async deleteEvent(req, res) {
    try {
      const deleted = await eventMongoDBService.deleteEvent(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Event not found' });
      }
      res.json({ success: true, message: 'Event deleted' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

module.exports = eventMongoDBController;