const Order = require("./order.schema");
const Inventory = require("../inventory/inventory.schema");
const AppError = require("../../shared/utils/GlobalError");

// 🔹 Validate items (Reusable)
const validateItems = (items) => {
  if (!items || items.length === 0) {
    throw new AppError("Ordered Items cannot be empty", 400);
  }

  for (let item of items) {
    if (!item.productId || !item.quantity || item.quantity < 1) {
      throw new AppError("Invalid item data", 400);
    }
  }
};

// 🔹 Create Order
exports.createOrderService = async (items) => {
  validateItems(items);

  const order = await Order.create({
    orderId: "ORD-" + Date.now(),
    status: "PENDING",
    items: items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    })),
  });

  return order;
};

// 🔹 Fulfill Order
exports.fulfillOrderService = async (orderId) => {
  const order = await Order.findOne({ orderId });

  if (!order) {
    throw new AppError("Order not found", 404);
  }

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

    if (stock === 0) {
      item.allocated = 0;
      allFulfilled = false;
    } 
    else if (stock < item.quantity) {
      item.allocated = stock;
      inventory.quantity = 0;

      allFulfilled = false;
      anyAllocated = true;

      await inventory.save();
    } 
    else {
      item.allocated = item.quantity;
      inventory.quantity -= item.quantity;

      anyAllocated = true;

      await inventory.save();
    }
  }

  // Final status
  if (allFulfilled) order.status = "FULFILLED";
  else if (anyAllocated) order.status = "PARTIAL";
  else order.status = "FAILED";

  await order.save();

  return order;
};