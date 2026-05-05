const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  totalPrice: { type: Number, required: true },
  bookingDate: { type: Date, default: Date.now },
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