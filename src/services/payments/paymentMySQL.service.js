const createBaseMySQLService = require("../common/baseMySQL.service");
const paymentMySQLRepository = require("../../repositories/payments/paymentMySQL.repository");
const bookingFoundationMySQLRepository = require("../../repositories/bookings/bookingFoundationMySQL.repository");
const userFoundationMySQLRepository = require("../../repositories/users/userFoundationMySQL.repository");
const discountMySQLRepository = require("../../repositories/discounts/discountMySQL.repository");
const transactionLogMySQLRepository = require("../../repositories/transactionLogs/transactionLogMySQL.repository");
const auditLogMySQLService = require("../auditLogs/auditLogMySQL.service");
const notificationMySQLService = require("../notifications/notificationMySQL.service");
const socketHub = require("../../realtime/socketHub");

const isAdmin = (actor = {}) => {
  const roles = Array.isArray(actor.roles) ? actor.roles : [];
  return roles.some((role) => String(role.name || role).toLowerCase() === "admin");
};

const paymentMySQLService = {
  ...createBaseMySQLService(paymentMySQLRepository),

  async create(data, actor = {}) {
    const bookingId = data.bookingId || data.booking_id;
    const requestedUserId = data.userId || data.user_id;
    const discountId = data.discountId || data.discount_id;

    const booking = await bookingFoundationMySQLRepository.findById(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    const userId = actor.userId || requestedUserId || booking.user_id || booking.userId;
    if (!isAdmin(actor) && Number(booking.user_id || booking.userId) !== Number(userId)) {
      throw new Error("You can only pay for your own booking");
    }

    if (!(await userFoundationMySQLRepository.findById(userId))) {
      throw new Error("User not found");
    }

    if (discountId && !(await discountMySQLRepository.findById(discountId))) {
      throw new Error("Discount not found");
    }

    const status = data.status === "failed" ? "failed" : data.status === "pending" ? "pending" : "paid";
    const payment = await paymentMySQLRepository.create({
      bookingId,
      userId,
      discountId: discountId || null,
      amount: Number(booking.total_price || booking.totalPrice || data.amount || 0),
      method: data.method || "card",
      status,
    });

    await transactionLogMySQLRepository.create({
      paymentId: payment.id,
      transactionType: "payment_attempt",
      status: payment.status === "failed" ? "failed" : "pending",
    });

    await auditLogMySQLService.log("payment.created", "payments", payment.id, {
      userId: actor.userId || userId,
      newValues: payment,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    if (payment.status === "paid") {
      const updatedBooking = await bookingFoundationMySQLRepository.update(bookingId, {
        userId: booking.user_id || booking.userId,
        matchId: booking.match_id || booking.matchId,
        totalPrice: booking.total_price || booking.totalPrice,
        status: "confirmed",
      });
      socketHub.emit("paymentCompleted", payment);
      socketHub.emit("bookingUpdated", updatedBooking);
      socketHub.emitDashboardUpdated({ reason: "paymentCompleted", payment, booking: updatedBooking });
      try {
        await notificationMySQLService.createNotification({
          userId,
          type: "payment",
          title: "Payment completed",
          message: "Your payment for booking #" + bookingId + " was completed successfully.",
          relatedEntityType: "payment",
          relatedEntityId: payment.id,
          sentAt: new Date(),
        });
      } catch (error) {
        if (error.code !== "ER_NO_SUCH_TABLE") {
          throw error;
        }
      }
    }
    return payment;
  },

  async getByBookingId(bookingId) {
    return await paymentMySQLRepository.findByBookingId(bookingId);
  },

  async getByUserId(userId) {
    return await paymentMySQLRepository.findByUserId(userId);
  },
};

module.exports = paymentMySQLService;
