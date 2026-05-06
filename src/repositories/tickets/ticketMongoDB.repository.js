const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  eventName: { type: String, required: true },
  seatNumber: { type: String, required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['available', 'booked', 'cancelled'], default: 'available' },
  userId: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);

const ticketMongoDBRepository = {
  async create(data) {
    const ticket = new Ticket(data);
    return await ticket.save();
  },

  async findAll() {
    return await Ticket.find();
  },

  async findById(id) {
    return await Ticket.findById(id);
  },

  async findByEvent(eventName) {
    return await Ticket.find({ eventName });
  },

  async update(id, data) {
    return await Ticket.findByIdAndUpdate(id, data, { new: true });
  },

  async delete(id) {
    return await Ticket.findByIdAndDelete(id);
  },
};

module.exports = ticketMongoDBRepository;
