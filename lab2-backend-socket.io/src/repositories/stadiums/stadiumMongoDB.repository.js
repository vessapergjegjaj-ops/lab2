const mongoose = require('mongoose');

const SeatCategorySchema = new mongoose.Schema({
  categoryName: { type: String, required: true },
  priceMultiplier: { type: Number, default: 1.0 },
});

const StadiumSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String },
  capacity: { type: Number, required: true },
  seatCategories: [SeatCategorySchema],
  createdAt: { type: Date, default: Date.now },
});

const Stadium = mongoose.models.Stadium || mongoose.model('Stadium', StadiumSchema);

const stadiumMongoDBRepository = {
  async create(data) {
    const stadium = new Stadium(data);
    return await stadium.save();
  },

  async findAll() {
    return await Stadium.find().sort({ name: 1 });
  },

  async findById(id) {
    return await Stadium.findById(id);
  },

  async update(id, data) {
    return await Stadium.findByIdAndUpdate(id, data, { new: true });
  },

  async delete(id) {
    return await Stadium.findByIdAndDelete(id);
  },

  async addSeatCategory(stadiumId, category) {
    return await Stadium.findByIdAndUpdate(
      stadiumId,
      { $push: { seatCategories: category } },
      { new: true }
    );
  },

  async removeSeatCategory(stadiumId, categoryId) {
    return await Stadium.findByIdAndUpdate(
      stadiumId,
      { $pull: { seatCategories: { _id: categoryId } } },
      { new: true }
    );
  },
};

module.exports = stadiumMongoDBRepository;