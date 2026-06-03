const createBaseMySQLService = require("../common/baseMySQL.service");
const paymentMySQLRepository = require("../../repositories/payments/paymentMySQL.repository");
const bookingFoundationMySQLRepository = require("../../repositories/bookings/bookingFoundationMySQL.repository");
const userFoundationMySQLRepository = require("../../repositories/users/userFoundationMySQL.repository");
const discountMySQLRepository = require("../../repositories/discounts/discountMySQL.repository");
const transactionLogMySQLRepository = require("../../repositories/transactionLogs/transactionLogMySQL.repository");
const auditLogMySQLService = require("../auditLogs/auditLogMySQL.service");
const notificationMySQLService = require("../notifications/notificationMySQL.service");
const socketHub = require("../../realtime/socketHub");

const paymentMySQLService = {
  ...createBaseMySQLService(paymentMySQLRepository),

  async create(data, actor = {}) {
    const bookingId = data.bookingId || data.booking_id;
    const userId = data.userId || data.user_id;
    const discountId = data.discountId || data.discount_id;

    if (!(await bookingFoundationMySQLRepository.findById(bookingId))) {
      throw new Error("Booking not found");
    }

    if (!(await userFoundationMySQLRepository.findById(userId))) {
      throw new Error("User not found");
    }

    if (discountId && !(await discountMySQLRepository.findById(discountId))) {
      throw new Error("Discount not found");
    }

    const payment = await paymentMySQLRepository.create({
      ...data,
      status: data.status || "pending",
      currency: data.currency || "USD",
    });

    await transactionLogMySQLRepository.create({
      paymentId: payment.id,
      bookingId,
      userId,
      transactionType: "payment_attempt",
      status: payment.status === "failed" ? "failed" : "pending",
      amount: payment.amount,
      currency: payment.currency,
      providerReference: payment.provider_payment_id,
      requestPayload: data.requestPayload || null,
      responsePayload: data.responsePayload || null,
    });

    await auditLogMySQLService.log("payment.created", "payments", payment.id, {
      userId: actor.userId || userId,
      newValues: payment,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    if (payment.status === "paid") {
      const booking = await bookingFoundationMySQLRepository.update(bookingId, { status: "confirmed" });
      socketHub.emit("paymentCompleted", payment);
      socketHub.emit("bookingUpdated", booking);
      socketHub.emitDashboardUpdated({ reason: "paymentCompleted", payment, booking });
      try {
        await notificationMySQLService.createNotification({
          userId,
          type: "payment",
          title: "Payment completed",
          message: "Your payment for booking #" + bookingId + " was completed successfully.",
          relatedEntityType: "payment",
          relatedEntityId: payment.id,
          status: "sent",
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
