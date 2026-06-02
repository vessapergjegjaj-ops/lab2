const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  ticketId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Ticket' },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  totalPrice: { type: Number, required: true },
  bookingDate: { type: Date, default: Date.now },
  cancelledAt: { type: Date, default: null },
  cancelledBy: { type: String, enum: ['user', 'system', 'admin'], default: null },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  paymentMethod: { type: String, default: null },
  paidAt: { type: Date, default: null },
});

const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);

const bookingMongoDBRepository = {
  async create(data) {
    const booking = new Booking(data);
    return await booking.save();
  },

  async findAll() {
    return await Booking.find()
      .populate('userId', 'name email')
      .populate('ticketId', 'eventName seatNumber price')
      .sort({ bookingDate: -1 });
  },

  async findById(id) {
    return await Booking.findById(id)
      .populate('userId', 'name email')
      .populate('ticketId', 'eventName seatNumber price');
  },

  async findByTicketId(ticketId) {
    return await Booking.findOne({ ticketId, status: { '$in': ['pending', 'confirmed'] } });
  },
  
  async findByUserId(userId) {
    return await Booking.find({ userId })
      .populate('userId', 'name email')
      .populate('ticketId', 'eventName seatNumber price')
      .sort({ bookingDate: -1 });
  },

  async update(id, data) {
    return await Booking.findByIdAndUpdate(id, data, { new: true });
  },

  async delete(id) {
    return await Booking.findByIdAndDelete(id);
  },
};

module.exports = bookingMongoDBRepository;
