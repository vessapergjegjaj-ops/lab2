const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  eventDate: { type: Date, required: true },
  stadiumLocation: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);

const eventMongoDBRepository = {
  async create(data) {
    const event = new Event(data);
    return await event.save();
  },

  async findAll() {
    return await Event.find().sort({ eventDate: -1 });
  },

  async findById(id) {
    return await Event.findById(id);
  },

  async findByDate(date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return await Event.find({
      eventDate: { $gte: startOfDay, $lte: endOfDay }
    });
  },

  async update(id, data) {
    return await Event.findByIdAndUpdate(id, data, { new: true });
  },

  async delete(id) {
    return await Event.findByIdAndDelete(id);
  },
};

module.exports = eventMongoDBRepository;