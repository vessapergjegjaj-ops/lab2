const { mongoose, mongoConfig } = require("../config/mongoose.config");

const mongodbConnection = {
  connect: async () => {
    try {
      await mongoose.connect(mongoConfig.uri, mongoConfig.options);
      console.log("MongoDB connected successfully");

      mongoose.connection.on("error", (err) => {
        console.error("MongoDB connection error:", err);
      });

      mongoose.connection.on("disconnected", () => {
        console.warn("MongoDB disconnected");
      });

      return true;
    } catch (error) {
      console.error("MongoDB connection failed:", error.message);
      return false;
    }
  },

  disconnect: async () => {
    try {
      await mongoose.disconnect();
      console.log("MongoDB disconnected");
    } catch (error) {
      console.error("MongoDB disconnect failed:", error.message);
    }
  },
};

module.exports = mongodbConnection;