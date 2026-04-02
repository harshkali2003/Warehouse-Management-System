const Inventory = require("../../modules/inventory/inventory.schema")

async function increaseStock({ productId, batchId, binId, quantity, session }) {
  return await Inventory.findOneAndUpdate(
    { productId, batchId, binId },
    {
      $inc: {
        quantity: quantity,
        availableQuantity: quantity,
      },
    },
    { new: true, session },
  );
}

async function decreaseStock({ productId, batchId, binId, quantity, session }) {
  const updatedInventory = await Inventory.findOneAndUpdate(
    {
      productId,
      batchId,
      binId,
      availableQuantity: { $gte: quantity }, // 🔥 KEY
    },
    {
      $inc: {
        quantity: -quantity,
        availableQuantity: -quantity,
      },
    },
    { new: true, session },
  );

  if (!updatedInventory) {
    throw new AppError("Insufficient stock", 400);
  }

  return updatedInventory;
}

module.exports = { increaseStock, decreaseStock };
