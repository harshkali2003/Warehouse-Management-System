const mongoose = require("mongoose");
const skuSchema = new mongoose.Schema(
  {
    skuCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      immutable : true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    unit: {
      type: String,
      enum: ["PCS", "KG", "LTR", "BOX"],
      required: true,
    },
    category: {
      type: String,
      enum: ["GROCERY", "ELECTRONICS", "PHARMA"],
      required: true,
    },
    isPerishable: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

skuSchema.index({skuCode : 1} , {unique : true});

module.exports = mongoose.model("Sku", skuSchema);
