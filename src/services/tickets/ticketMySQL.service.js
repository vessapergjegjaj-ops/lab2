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
    if (!ticket.eventName || !ticket.seatNumber || !ticket.price) {
      throw new Error('Event name, seat number, and price are required');
    }
    return await ticketMySQLRepository.create(ticket);
  },

  async updateTicket(id, ticket) {
    if (!ticket.eventName || !ticket.seatNumber || !ticket.price) {
      throw new Error('Event name, seat number, and price are required');
    }
    return await ticketMySQLRepository.update(id, ticket);
  },

  async deleteTicket(id) {
    return await ticketMySQLRepository.delete(id);
  },
};

module.exports = ticketMySQLService;