const {
  createOrderService,
  fulfillOrderService,
} = require("./order.service");

// 🔹 Create Order Controller
exports.createOrder = async (req, res, next) => {
  try {
    const order = await createOrderService(req.body.items);

    return res.status(201).json({
      success: true,
      order,
    });
  } catch (err) {
    next(err);
  }
};

// 🔹 Fulfill Order Controller
exports.fulfillOrder = async (req, res, next) => {
  try {
    const order = await fulfillOrderService(req.params.orderId);

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    next(err);
  }
};