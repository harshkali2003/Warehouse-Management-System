const Inventory = require("./inventory.schema");
const StockMovement = require("./stockmovement.schema");

const AppError = require("../../shared/utils/GlobalError");
const { default: mongoose } = require("mongoose");
const AvailableStock = require("../../shared/utils/inventory.utils");

exports.createInventory = async (req, resp, next) => {
  try {
    const user = req.user?.id;
    if (!user) {
      return next(new AppError("Login first", 401));
    }

    const { productId, batchId, binId, quantity } = req.body;
    if (!productId || !batchId || !binId || quantity === undefined) {
      return next(new AppError("All fields are required", 400));
    }

    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(batchId) ||
      !mongoose.Types.ObjectId.isValid(binId)
    ) {
      return next(new AppError("Provide a valid id", 400));
    }

    if (quantity < 0 || typeof quantity !== "number") {
      return next(new AppError("Provide a valid quantity", 400));
    }

    const inventory = await Inventory.findOneAndUpdate(
      { productId, batchId, binId },
      { $inc: { quantity: quantity, availableQuantity: quantity } },
      { upsert: true, new: true, runValidators: true },
    );

    const [movement] = await StockMovement.create([{
      productId,
      batchId,
      fromBinId: null,
      toBinId: binId,
      quantity: quantity,
      movementType: "INBOUND",
      note: "Stock has been added to Inventory",
    }]);

    return resp.status(201).json({ message: "success", inventory, movement });
  } catch (err) {
    next(err);
  }
};

exports.getInventory = async (req, resp, next) => {
  try {
    const user = req.user?.id;
    if (!user) {
      return next(new AppError("Login first", 401));
    }

    const { productId, batchId, binId } = req.query;

    const filter = {};

    if (productId) {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return next(new AppError("Invalid Id", 400));
      }

      filter.productId = productId;
    }

    if (batchId) {
      if (!mongoose.Types.ObjectId.isValid(batchId)) {
        return next(new AppError("Invalid Id", 400));
      }

      filter.batchId = batchId;
    }

    if (binId) {
      if (!mongoose.Types.ObjectId.isValid(binId)) {
        return next(new AppError("Invalid Id", 400));
      }

      filter.binId = binId;
    }

    const inventory = await Inventory.find(filter);

    if (inventory.length === 0) {
      return next(new AppError("No stock found", 404));
    }

    return resp
      .status(200)
      .json({ message: "success", data: inventory, count: inventory.length });
  } catch (err) {
    next(err);
  }
};

exports.updateInventory = async (req, resp, next) => {
  try {
    const user = req.user?.id;
    if (!user) {
      return next(new AppError("Log in first", 401));
    }

    const { type, productId, batchId, binId, quantity } = req.body;

    if (!type || !productId || !batchId || !binId || quantity === undefined) {
      return next(new AppError("All fields are required", 400));
    }

    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(batchId) ||
      !mongoose.Types.ObjectId.isValid(binId)
    ) {
      return next(new AppError("Invalid Id", 400));
    }

    if (typeof quantity !== "number" || quantity <= 0) {
      return next(new AppError("Quantity must be positive number", 400));
    }

    const inventory = await Inventory.findOne({ productId, batchId, binId });

    if (!inventory) {
      return next(new AppError("No Inventory found", 404));
    }

    let movement;

    switch (type) {
      case "INBOUND":
        inventory.quantity += quantity;
        inventory.availableQuantity += quantity;

        await inventory.save();

        [movement] = await StockMovement.create([
          {
            productId,
            batchId,
            fromBinId: null,
            toBinId: binId,
            quantity,
            movementType: "INBOUND",
            note: "Stock added",
          },
        ]);

        break;

      case "OUTBOUND":
        if (inventory.availableQuantity < quantity) {
          return next(new AppError("Insufficient stock", 400));
        }

        inventory.quantity -= quantity;
        inventory.availableQuantity -= quantity;

        await inventory.save();

        [movement] = await StockMovement.create([
          {
            productId,
            batchId,
            fromBinId: binId,
            toBinId: null,
            quantity,
            movementType: "OUTBOUND",
            note: "Stock removed",
          },
        ]);

        break;

      default:
        return next(new AppError("Invalid type", 400));
    }

    return resp.status(200).json({
      success: true,
      data: inventory,
      movement,
    });
  } catch (err) {
    next(err);
  }
};

exports.reserveStock = async (req, resp, next) => {
  try {
    const user = req.user?.id;
    if (!user) {
      return next(new AppError("Login first", 401));
    }

    const { productId, batchId, binId, quantity } = req.body;

    if (!productId || !batchId || !binId || quantity === undefined) {
      return next(new AppError("All fields are required", 400));
    }

    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(batchId) ||
      !mongoose.Types.ObjectId.isValid(binId)
    ) {
      return next(new AppError("Invalid Id", 400));
    }

    if (typeof quantity !== "number" || quantity <= 0) {
      return next(new AppError("Quantity must be positive number", 400));
    }

    const inventory = await Inventory.findOne({ productId, batchId, binId });
    if (!inventory) {
      return next(new AppError("No stock found", 404));
    }

    const quantityCheck = AvailableStock(inventory.availableQuantity, quantity);

    if (quantityCheck < 0) {
      return next(new AppError("Not enough stock", 400));
    }

    inventory.reservedQuantity += quantity;
    inventory.availableQuantity -= quantity;
    await inventory.save();

    const [movement] = await StockMovement.create([
      {
        productId,
        batchId,
        fromBinId: binId,
        toBinId: null,
        quantity,
        movementType: "RESERVE",
        note: "Stock reserved",
      },
    ]);

    return resp.status(200).json({ success: true, data: inventory, movement });
  } catch (err) {
    next(err);
  }
};

exports.releaseStock = async (req, resp, next) => {
  try {
    const user = req.user?.id;
    if (!user) {
      return next(new AppError("Login first", 401));
    }

    const { productId, batchId, binId, quantity } = req.body;

    if (!productId || !batchId || !binId || quantity === undefined) {
      return next(new AppError("All fields are required", 400));
    }

    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(batchId) ||
      !mongoose.Types.ObjectId.isValid(binId)
    ) {
      return next(new AppError("Invalid Id", 400));
    }

    if (typeof quantity !== "number" || quantity <= 0) {
      return next(new AppError("Quantity must be positive number", 400));
    }

    const inventory = await Inventory.findOne({ productId, batchId, binId });
    if (!inventory) {
      return next(new AppError("No stock found", 404));
    }

    if (inventory.reservedQuantity < quantity) {
      return next(new AppError("Cannot release more than reserved stock", 400));
    }

    inventory.reservedQuantity -= quantity;
    inventory.availableQuantity += quantity;
    await inventory.save();

    const [movement] = await StockMovement.create([
      {
        productId,
        batchId,
        fromBinId: null,
        toBinId: binId,
        quantity,
        movementType: "RELEASED",
        note: "Stock released",
      },
    ]);

    return resp.status(200).json({ success: true, data: inventory, movement });
  } catch (err) {
    next(err);
  }
};
