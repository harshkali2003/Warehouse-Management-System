const mongoose = require("mongoose");
const inventorySchema = new mongoose.Schema(
  {
    skuId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sku",
      required: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
    binId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bin",
      required: true,
    },
    warehouse_id : {
      type : mongoose.Schema.Types.ObjectId,
      ref : "Warehouse",
      required : true,
    },
    quantity: {
      type: Number,
      required: true,
      min : 1,
      validate : Number.isInteger,
    },
    status: {
      type: String,
      enum: ["AVAILABLE", "DAMAGED", "RESERVED"],
      default: "AVAILABLE",
    },
  },
  { timestamps: true },
);

inventorySchema.index({ skuId: 1, batchId: 1, binId: 1 }, { unique: true });

module.exports = mongoose.model("Inventory", inventorySchema);
