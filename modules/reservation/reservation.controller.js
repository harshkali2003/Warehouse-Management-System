const {
  reserveOrderService,
  confirmOrderService,
  cancelOrderService,
} = require("./reservation.service");

// 🔹 Reserve
exports.reserveOrder = async (req, res, next) => {
  try {
    const reservation = await reserveOrderService({
      userId: req.user?.id,
      orderId: req.params.orderId,
      body: req.body,
    });

    return res.status(200).json({
      success: true,
      data: reservation,
    });
  } catch (err) {
    next(err);
  }
};

// 🔹 Confirm
exports.confirmOrder = async (req, res, next) => {
  try {
    const orders = await confirmOrderService(req.params.orderId);

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (err) {
    next(err);
  }
};

// 🔹 Cancel
exports.cancelOrder = async (req, res, next) => {
  try {
    const orders = await cancelOrderService(req.params.orderId);

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (err) {
    next(err);
  }
};