const Inventory = require("../../modules/inventory/inventory.schema");

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

async function reserveStock({ productId, batchId, binId, quantity, session }) {
  const inventory = await Inventory.findOneAndUpdate(
    { productId, batchId, binId },
    {
      $inc: {
        reservedQuantity: quantity,
        availableQuantity: -quantity,
      },
    },
    { new: true, session },
  );

  if (!inventory) {
    throw new AppError("Insufficient stock", 400);
  }

  return inventory;
}

async function releaseStock({ productId, batchId, binId, quantity, session }) {
  const inventory = await Inventory.findOneAndUpdate(
    { productId, batchId, binId, reservedQuantity: { $gte: quantity } },
    {
      $inc: {
        reservedQuantity: -quantity,
        availableQuantity: quantity,
      },
    },
    { new: true, session },
  );

  if (!inventory) {
    throw new AppError("Invalid release operation", 400);
  }

  return inventory;
}

async function confirmStock({ productId, batchId, binId, quantity, session }) {
  const inventory = await Inventory.findOneAndUpdate(
    { productId, batchId, binId, reservedQuantity: { $gte: quantity } },
    {
      $inc: {
        reservedQuantity: -quantity,
        quantity: -quantity,
      },
    },
    { new: true, session },
  );

  if (!inventory) {
    throw new AppError("Invalid release operation", 400);
  }

  return inventory;
}

module.exports = { increaseStock, decreaseStock, reserveStock, releaseStock , confirmStock };
