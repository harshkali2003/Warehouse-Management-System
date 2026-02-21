const mongoose = require("mongoose");
const batchSchema = new mongoose.Schema(
  {
    skuId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sku",
      required: true,
    },
    batch_number: {
      type: Number,
      required: true,
      unique: true,
    },
    manufacturing_date: {
      type: Date,
      required: true,
    },
    expiry_date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

batchSchema.index({skuId : 1} , {unique : true});

module.exports = mongoose.model("Batch", batchSchema);
