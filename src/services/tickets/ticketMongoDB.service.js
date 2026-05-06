const ticketMongoDBRepository = require('../../repositories/tickets/ticketMongoDB.repository');

const ticketMongoDBService = {
  async getAllTickets() {
    return await ticketMongoDBRepository.findAll();
  },

  async getTicketById(id) {
    return await ticketMongoDBRepository.findById(id);
  },

  async getTicketsByEvent(eventName) {
    return await ticketMongoDBRepository.findByEvent(eventName);
  },

  async createTicket(ticket) {
    const missing = [];
    if (!ticket.eventName) missing.push('eventName');
    if (!ticket.seatNumber) missing.push('seatNumber');
    if (!ticket.price) missing.push('price');
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    return await ticketMongoDBRepository.create(ticket);
  },

  async updateTicket(id, ticket) {
    const missing = [];
    if (!ticket.eventName) missing.push('eventName');
    if (!ticket.seatNumber) missing.push('seatNumber');
    if (!ticket.price) missing.push('price');
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    return await ticketMongoDBRepository.update(id, ticket);
  },

  async deleteTicket(id) {
    return await ticketMongoDBRepository.delete(id);
  },
};

module.exports = ticketMongoDBService;