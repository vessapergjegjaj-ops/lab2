const ticketMongoDBService = require('../../services/tickets/ticketMongoDB.service');

const ticketMongoDBController = {
  async getAllTickets(req, res) {
    try {
      const tickets = await ticketMongoDBService.getAllTickets();
      res.json({ success: true, data: tickets });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getTicketById(req, res) {
    try {
      const ticket = await ticketMongoDBService.getTicketById(req.params.id);
      if (!ticket) {
        return res.status(404).json({ success: false, error: 'Ticket not found' });
      }
      res.json({ success: true, data: ticket });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getTicketsByEvent(req, res) {
    try {
      const tickets = await ticketMongoDBService.getTicketsByEvent(req.params.eventName);
      res.json({ success: true, data: tickets });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async createTicket(req, res) {
    try {
      console.log('req.body:', req.body);
      console.log('raw body:', JSON.stringify(req.body));
      const ticket = await ticketMongoDBService.createTicket(req.body);
      res.status(201).json({ success: true, data: ticket });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async updateTicket(req, res) {
    try {
      const ticket = await ticketMongoDBService.updateTicket(req.params.id, req.body);
      if (!ticket) {
        return res.status(404).json({ success: false, error: 'Ticket not found' });
      }
      res.json({ success: true, data: ticket });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async deleteTicket(req, res) {
    try {
      const deleted = await ticketMongoDBService.deleteTicket(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Ticket not found' });
      }
      res.json({ success: true, message: 'Ticket deleted' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

module.exports = ticketMongoDBController;