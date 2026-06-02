let ioInstance = null;

const socketHub = {
  attach(io) {
    ioInstance = io;
  },

  emitToUser(userId, eventName, payload) {
    if (!ioInstance || !userId) {
      return false;
    }

    ioInstance.to("user:" + userId).emit(eventName, payload);
    return true;
  },

  emit(eventName, payload) {
    if (!ioInstance) {
      return false;
    }

    ioInstance.emit(eventName, payload);
    return true;
  },

  isAttached() {
    return Boolean(ioInstance);
  },
};

module.exports = socketHub;
