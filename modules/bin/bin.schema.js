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
      unique: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
  },
  { timeStamps: true },
);

binSchema.index({ warehouseId: 1, binCode: 1 }, { unique: true });

module.exports = mongoose.model("Bin", binSchema);