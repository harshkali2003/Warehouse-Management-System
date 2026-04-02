const Inventory = require("./inventory.schema");
const StockMovement = require("./stockmovement.schema");

const AppError = require("../../shared/utils/GlobalError");
const { default: mongoose } = require("mongoose");
const AvailableStock = require("../../shared/utils/inventory.utils");
const {
  increaseStock,
  decreaseStock,
} = require("../../shared/utils/StockHandeling.utils");

exports.createInventory = async (req, resp, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = req.user?.id;
    if (!user) {
      throw new AppError("Login first", 401);
    }

    const { productId, batchId, binId, quantity } = req.body;
    if (!productId || !batchId || !binId || quantity === undefined) {
      throw new AppError("All fields are required", 400);
    }

    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(batchId) ||
      !mongoose.Types.ObjectId.isValid(binId)
    ) {
      throw new AppError("Provide a valid id", 400);
    }

    if (quantity < 0 || typeof quantity !== "number") {
      throw new AppError("Provide a valid quantity", 400);
    }

    const inventory = await Inventory.findOneAndUpdate(
      { productId, batchId, binId },
      { $inc: { quantity: quantity, availableQuantity: quantity } },
      { upsert: true, new: true, runValidators: true, session },
    );

    const [movement] = await StockMovement.create(
      [
        {
          productId,
          batchId,
          fromBinId: null,
          toBinId: binId,
          quantity: quantity,
          movementType: "INBOUND",
          note: "Stock has been added to Inventory",
        },
      ],
      { session },
    );

    await session.commitTransaction();
    return resp.status(201).json({ message: "success", inventory, movement });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = req.user?.id;
    if (!user) throw new AppError("Log in first", 401);

    const { type, productId, batchId, fromBinId, toBinId, quantity } = req.body;

    if (!type || !productId || !batchId || quantity === undefined) {
      throw new AppError("All fields are required", 400);
    }

    if (
      (type === "INBOUND" && !toBinId) ||
      (type === "OUTBOUND" && !fromBinId) ||
      (type === "TRANSFER" && (!fromBinId || !toBinId))
    ) {
      throw new AppError("Bin id is required according to type", 400);
    }

    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(batchId)
    ) {
      throw new AppError("Invalid Id", 400);
    }

    if (fromBinId && !mongoose.Types.ObjectId.isValid(fromBinId)) {
      throw new AppError("Invalid fromBinId", 400);
    }

    if (toBinId && !mongoose.Types.ObjectId.isValid(toBinId)) {
      throw new AppError("Invalid toBinId", 400);
    }

    if (typeof quantity !== "number" || quantity <= 0) {
      throw new AppError("Quantity must be positive number", 400);
    }

    let updatedInventory;
    let movement;

    switch (type) {
      case "INBOUND":
        updatedInventory = await increaseStock({
          productId,
          batchId,
          binId: toBinId,
          quantity,
          session,
        });

        [movement] = await StockMovement.create(
          [
            {
              productId,
              batchId,
              fromBinId: null,
              toBinId,
              quantity,
              movementType: "INBOUND",
              note: "Stock added",
            },
          ],
          { session },
        );
        break;

      case "OUTBOUND":
        updatedInventory = await decreaseStock({
          productId,
          batchId,
          binId: fromBinId,
          quantity,
          session,
        });

        [movement] = await StockMovement.create(
          [
            {
              productId,
              batchId,
              fromBinId,
              toBinId: null,
              quantity,
              movementType: "OUTBOUND",
              note: "Stock removed",
            },
          ],
          { session },
        );
        break;

      case "TRANSFER":
        await decreaseStock({
          productId,
          batchId,
          binId: fromBinId,
          quantity,
          session,
        });

        updatedInventory = await increaseStock({
          productId,
          batchId,
          binId: toBinId,
          quantity,
          session,
        });

        [movement] = await StockMovement.create(
          [
            {
              productId,
              batchId,
              fromBinId,
              toBinId,
              quantity,
              movementType: "TRANSFER",
              note: "Stock transferred",
            },
          ],
          { session },
        );
        break;

      default:
        throw new AppError("Invalid type", 400);
    }

    await session.commitTransaction();

    return resp.status(200).json({
      success: true,
      data: updatedInventory,
      movement,
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

exports.reserveStock = async (req, resp, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = req.user?.id;
    if (!user) {
      throw new AppError("Login first", 401);
    }

    const { productId, batchId, binId, quantity } = req.body;

    if (!productId || !batchId || !binId || quantity === undefined) {
      throw new AppError("All fields are required", 400);
    }

    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(batchId) ||
      !mongoose.Types.ObjectId.isValid(binId)
    ) {
      throw new AppError("Invalid Id", 400);
    }

    if (typeof quantity !== "number" || quantity <= 0) {
      throw new AppError("Quantity must be positive number", 400);
    }

    const updatedInventory = await Inventory.findOneAndUpdate(
      {
        productId,
        batchId,
        binId,
        availableQuantity: { $gte: quantity },
      },
      {
        $inc: {
          reservedQuantity: quantity,
          availableQuantity: -quantity,
        },
      },
      { new: true, session },
    );

    if (!updatedInventory) {
      throw new AppError("Not enough stock", 400);
    }

    const [movement] = await StockMovement.create(
      [
        {
          productId,
          batchId,
          fromBinId: binId,
          toBinId: null,
          quantity,
          movementType: "RESERVE",
          note: "Stock reserved",
        },
      ],
      { session },
    );

    await session.commitTransaction();
    return resp
      .status(200)
      .json({ success: true, data: updatedInventory, movement });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

exports.releaseStock = async (req, resp, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = req.user?.id;
    if (!user) {
      throw new AppError("Login first", 401);
    }

    const { productId, batchId, binId, quantity } = req.body;

    if (!productId || !batchId || !binId || quantity === undefined) {
      throw new AppError("All fields are required", 400);
    }

    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(batchId) ||
      !mongoose.Types.ObjectId.isValid(binId)
    ) {
      throw new AppError("Invalid Id", 400);
    }

    if (typeof quantity !== "number" || quantity <= 0) {
      throw new AppError("Quantity must be positive number", 400);
    }

    const updatedInventory = await Inventory.findOneAndUpdate(
      {
        productId,
        batchId,
        binId,
        reservedQuantity: { $gte: quantity },
      },
      {
        $inc: {
          reservedQuantity: -quantity,
          availableQuantity: quantity,
        },
      },
      { new: true, session },
    );

    if (!updatedInventory) {
      throw new AppError("Cannot release more than reserved stock", 400);
    }

    const [movement] = await StockMovement.create(
      [
        {
          productId,
          batchId,
          fromBinId: null,
          toBinId: binId,
          quantity,
          movementType: "RELEASED",
          note: "Stock released",
        },
      ],
      { session },
    );

    await session.commitTransaction();
    return resp.status(200).json({ success: true, data: updatedInventory, movement });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};
