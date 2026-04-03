const Reservation = require("./reservation.schema");
const AppError = require("../../shared/utils/GlobalError");
const { default: mongoose } = require("mongoose");
const {
  reserveStock,
  confirmStock,
  releaseStock,
} = require("../../shared/utils/StockHandeling.utils");

exports.reserveOrder = async (req, resp, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = req.user?.id;
    if (!user) {
      throw new AppError("Login first", 400);
    }

    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new AppError("Invalid Id", 400);
    }

    const { productId, batchId, binId, quantity } = req.body;
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
      throw new AppError("Insuefficient Stock", 404);
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
      { session },
    );

    await session.commitTransaction();
    return resp.status(200).json({ success: true, data: reservation });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

exports.confirmOrder = async (req, resp, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new AppError("Invalid Id", 400);
    }

    const orders = await Reservation.find({
      orderId,
      status: "RESERVED",
    }).session(session);
    if (orders.length === 0) {
      throw new AppError("No order found", 404);
    }

    if (orders.some((o) => o.status !== "RESERVED")) {
      throw new AppError("Order already processed", 400);
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
    return resp.status(200).json({ success: true, data: orders });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

exports.cancelOrder = async (req, resp, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new AppError("Invalid Id", 400);
    }

    const orders = await Reservation.find({
      orderId,
      status: "RESERVED",
    }).session(session);
    if (orders.length === 0) {
      throw new AppError("No order found", 404);
    }

    if (orders.some((o) => o.status !== "RESERVED")) {
      throw new AppError("Order cannot be cancelled", 400);
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
    return resp.status(200).json({ success: true, data: orders });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};
