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
    if (!ticket.eventName || !ticket.seatNumber || !ticket.price) {
      throw new Error('Event name, seat number, and price are required');
    }
    return await ticketMongoDBRepository.create(ticket);
  },

  async updateTicket(id, ticket) {
    if (!ticket.eventName || !ticket.seatNumber || !ticket.price) {
      throw new Error('Event name, seat number, and price are required');
    }
    return await ticketMongoDBRepository.update(id, ticket);
  },

  async deleteTicket(id) {
    return await ticketMongoDBRepository.delete(id);
  },
};

module.exports = ticketMongoDBService;