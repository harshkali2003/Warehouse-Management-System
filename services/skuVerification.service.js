const inventorySchema = require("../modules/inventory/inventory.schema");

async function preventDelete({ skuId }) {
  try {
    const inventory = await inventorySchema.exists({
      skuId: skuId,
      quantity: { $gt: 0 },
    });

    if (inventory) {
      const error = new Error("Cannot delete SKU because inventory exists");
      error.statusCode = 400;
      throw error;
    }

    return true;
  } catch (err) {
    if (err.statusCode) {
      throw err;
    }

    console.error("Delete validation failed:", err);
    throw new Error("Internal server error");
  }
}

module.exports = { preventDelete };
