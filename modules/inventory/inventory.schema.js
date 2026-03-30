const mongoose = require("mongoose");
const AppError = require("../../shared/utils/GlobalError");

const inventorySchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products",
      required: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    binId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bin",
      required: true,
    },
    reservedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    availableQuantity: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

inventorySchema.pre("save", function (next) {
  this.availableQuantity = this.quantity - this.reservedQuantity;
  if (this.availableQuantity < 0) {
    return next(new AppError("Reserved quantity cannot exceed total quantity"));
  }
  next();
});

inventorySchema.index({ productId: 1, binId: 1, batchId: 1 }, { unique: true });

module.exports = mongoose.model("Inventory", inventorySchema);
