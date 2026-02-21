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

warehouseSchema.index({warehouse_code : 1} , {unique : true});
warehouseSchema.index({location : "2dsphere"});
warehouseSchema.index({ isActive: 1 });
warehouseSchema.index({ location: "2dsphere", isActive: 1 })

module.exports = mongoose.model("Warehouse", warehouseSchema);