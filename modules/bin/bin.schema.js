const mongoose = require("mongoose");
const binSchema = new mongoose.Schema(
  {
    bin_code: {
      type: String,
      required: true,
    },
    warehouse_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    zone: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["PALLET", "SHELF", "BULK"],
      default: "PALLET",
    },
    capacity: {
      type: Number,
      required: true,
    },
    used_capacity: {
      type: Number,
      required: true,
      default: 0,
    },
    isActive: {
      type: Boolean,
      required: true,
    },
    isBlocked: {
      type: Boolean,
      required: true,
    },
    bin_priority: {
      type: Number,
    },
  },
  { timeStamps: true },
);

binSchema.index({ warehouse_id: 1, bin_code: 1 }, { unique: true });

module.exports = mongoose.model("Bin", binSchema);
