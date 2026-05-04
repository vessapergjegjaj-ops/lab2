const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const userMongoDBRepository = {
  async create(data) {
    const user = new User(data);
    return await user.save();
  },

  async findAll() {
    return await User.find();
  },

  async findById(id) {
    return await User.findById(id);
  },

  async update(id, data) {
    return await User.findByIdAndUpdate(id, data, { new: true });
  },

  async delete(id) {
    return await User.findByIdAndDelete(id);
  },
};

module.exports = userMongoDBRepository;
