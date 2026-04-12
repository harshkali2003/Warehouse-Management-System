const Order = require("./order.schema");
const Inventory = require("../inventory/inventory.schema");

const AppError = require("../../shared/utils/GlobalError");

exports.createOrder = async (req, resp, next) => {
  try {
    const { items } = req.body;
    if (!items || items.length === 0) {
      throw new AppError("Ordered Items cannot be empty", 400);
    }

    for (let item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        throw new AppError("Invalid item data", 400);
      }
    }

    const order = await Order.create({
      orderId: "ORD-" + Date.now(),
      status: "PENDING",
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    });

    return resp.status(201).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

exports.fulfillOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    // prevent re-processing
    if (order.status !== "PENDING") {
      throw new AppError("Order already processed", 400);
    }

    order.status = "PROCESSING";

    let allFulfilled = true;
    let anyAllocated = false;

    for (let item of order.items) {
      const inventory = await Inventory.findOne({
        productId: item.productId,
      });

      const stock = inventory?.quantity || 0;

      // ❌ Out of stock
      if (stock === 0) {
        item.allocated = 0;
        allFulfilled = false;
      }

      // ⚠️ Partial
      else if (stock < item.quantity) {
        item.allocated = stock;
        inventory.quantity = 0;

        allFulfilled = false;
        anyAllocated = true;

        await inventory.save();
      }

      // ✅ Full
      else {
        item.allocated = item.quantity;
        inventory.quantity -= item.quantity;

        anyAllocated = true;

        await inventory.save();
      }
    }

    // 🎯 Final Status Decision
    if (allFulfilled) {
      order.status = "FULFILLED";
    } else if (anyAllocated) {
      order.status = "PARTIAL";
    } else {
      order.status = "FAILED";
    }

    await order.save();

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    next(err);
  }
};
