const mongoose = require("mongoose")
const stockLedgerSchema = new mongoose.Schema(
  {
    inventoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },
    type: {
      type: String,
      enum: ["IN", "OUT", "ADJUSTMENT", "RESERVATION", "RELEASE"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    referenceId: {
      type: String, // orderId, shipmentId
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StockLog" , stockLedgerSchema);