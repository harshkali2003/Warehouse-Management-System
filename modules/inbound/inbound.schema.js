const mongoose = require("mongoose");
const inboundSchema = new mongoose.Schema(
  {
    shipment_id: {
      type: String,
      required: true,
    },
    supplier: {
      type: String,
      required: true,
      lowercase: true,
    },
    expected_items: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min : 1,
        },
      },
    ],
    status: {
      type: String,
      enum: ["PENDING", "CREATED", "RECEIVED", "CLOSED"],
      default: "CREATED",
    },
  },
  { timestamps: true },
);

inboundSchema.index({ shipment_id: 1 }, { unique: true });

module.exports = mongoose.model("Inbound", inboundSchema);
