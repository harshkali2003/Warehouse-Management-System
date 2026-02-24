const mongoose = require("mongoose");
const putwaySchema = new mongoose.Schema({
  grn_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Grn",
    required: true,
  },
  sku_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sku",
    required: true,
  },
  batch_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
    required: true,
  },
  status: {
    type: String,
    enum: ["PENDING", "IN_PROCESS", "COMPLETED", "FAILED"],
    default: "PENDING",
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  total_quantity: {
    type: Number,
    required: true,
    min: 1,
    validate: Number.isInteger,
  },
  items: [
    {
      bin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bin",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
        validate: Number.isInteger,
      },
    },
  ],
  failure_reason: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
});

putwaySchema.index({sku_id : 1});
putwaySchema.index({status : 1});
putwaySchema.index({assignedTo : 1 , status : 1});

module.exports = mongoose.model("Putway", putwaySchema);
