const mongoose = require("mongoose");

const skuAuditSchema = new mongoose.Schema(
  {
    skuId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sku",
      required: true,
    },

    action: {
      type: String,
      enum: ["CREATED", "UPDATED", "DEACTIVATED"],
      required: true,
    },

    changes: {
      type: Object,
      required : true,
      // Example:
      // {
      //   name: { old: "Sugar", new: "Brown Sugar" },
      //   unit: { old: "KG", new: "PCS" }
      // }
    },

    performedBy: {
      type: String, 
      required: true,
    },

    reason: {
      type: String, 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SkuAuditLog", skuAuditSchema);
