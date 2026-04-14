const Reservation = require("./reservation.schema");
const AppError = require("../../shared/utils/GlobalError");
const mongoose = require("mongoose");

const {
  reserveStock,
  confirmStock,
  releaseStock,
} = require("../../shared/utils/StockHandeling.utils");

// 🔹 Common validation
const validateObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid Id", 400);
  }
};

// 🔹 Reserve Order
exports.reserveOrderService = async ({ userId, orderId, body }) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!userId) {
      throw new AppError("Login first", 400);
    }

    validateObjectId(orderId);

    const { productId, batchId, binId, quantity } = body;

    if (!productId || !batchId || !binId || quantity === undefined) {
      throw new AppError("All fields are required", 400);
    }

    if (quantity <= 0 || typeof quantity !== "number") {
      throw new AppError("quantity can't be negative or non-numeric", 400);
    }

    const inventory = await reserveStock({
      productId,
      batchId,
      binId,
      quantity,
      session,
    });

    if (!inventory) {
      throw new AppError("Insufficient Stock", 404);
    }

    const [reservation] = await Reservation.create(
      [
        {
          orderId,
          productId,
          batchId,
          binId,
          quantity,
          status: "RESERVED",
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return reservation;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

// 🔹 Confirm Order
exports.confirmOrderService = async (orderId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    validateObjectId(orderId);

    const orders = await Reservation.find({
      orderId,
      status: "RESERVED",
    }).session(session);

    if (orders.length === 0) {
      throw new AppError("No order found", 404);
    }

    for (const order of orders) {
      await confirmStock({
        productId: order.productId,
        batchId: order.batchId,
        binId: order.binId,
        quantity: order.quantity,
        session,
      });

      order.status = "CONFIRMED";
      await order.save({ session });
    }

    await session.commitTransaction();
    return orders;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

// 🔹 Cancel Order
exports.cancelOrderService = async (orderId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    validateObjectId(orderId);

    const orders = await Reservation.find({
      orderId,
      status: "RESERVED",
    }).session(session);

    if (orders.length === 0) {
      throw new AppError("No order found", 404);
    }

    for (const order of orders) {
      await releaseStock({
        productId: order.productId,
        batchId: order.batchId,
        binId: order.binId,
        quantity: order.quantity,
        session,
      });

      order.status = "CANCELLED";
      await order.save({ session });
    }

    await session.commitTransaction();
    return orders;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};