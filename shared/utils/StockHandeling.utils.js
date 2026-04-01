async function increaseStock({ inventory, quantity }) {
  try {
    inventory.quantity += quantity;
    inventory.availableQuantity += quantity;
    await inventory.save();
  } catch (err) {
    throw err;
  }
}

async function decreaseStock({ inventory, quantity }) {
  try {
    if (inventory.availableQuantity < quantity) {
      throw new Error("Insufficient stock");
    }
    inventory.quantity -= quantity;
    inventory.availableQuantity -= quantity;
    await inventory.save();
  } catch (err) {
    throw err;
  }
}

module.exports = { increaseStock, decreaseStock };
