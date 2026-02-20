const mongoose = require("mongoose");
const warehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    warehouse_code: {
      type: String,
      required: true,
      unique: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    totalBins: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

warehouseSchema.index({location : "2dsphere"})

module.exports = mongoose.model("Warehouse", warehouseSchema);
