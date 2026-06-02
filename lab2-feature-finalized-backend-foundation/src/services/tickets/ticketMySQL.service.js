const ticketMySQLRepository = require('../../repositories/tickets/ticketMySQL.repository');

const ticketMySQLService = {
  async getAllTickets() {
    return await ticketMySQLRepository.findAll();
  },

  async getTicketById(id) {
    return await ticketMySQLRepository.findById(id);
  },

  async getTicketsByEvent(eventName) {
    return await ticketMySQLRepository.findByEvent(eventName);
  },

  async createTicket(ticket) {
    const missing = [];
    if (!ticket.eventName) missing.push('eventName');
    if (!ticket.seatNumber) missing.push('seatNumber');
    if (!ticket.price) missing.push('price');
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    return await ticketMySQLRepository.create(ticket);
  },

  async updateTicket(id, ticket) {
    const missing = [];
    if (!ticket.eventName) missing.push('eventName');
    if (!ticket.seatNumber) missing.push('seatNumber');
    if (!ticket.price) missing.push('price');
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    return await ticketMySQLRepository.update(id, ticket);
  },

  async deleteTicket(id) {
    return await ticketMySQLRepository.delete(id);
  },
};

module.exports = ticketMySQLService;