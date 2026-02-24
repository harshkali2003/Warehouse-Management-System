const mongoose = require("mongoose");
const outboundSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    items: [
      {
        sku: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    priority: {
      type: String,
      enum: ["NORMAL", "FAST_DELIVERY", "SAME_DAY_DELIVERY"],
      default: "NORMAL",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "CREATED",
        "ALLOCATED",
        "PICKED",
        "PACKED",
        "DISPATCHED",
        "CANCELLED",
      ],
      default: "CREATED",
    },
  },
  { timestamps: true },
);

outboundSchema.index({ order_id: 1 }, { unique: true });

module.exports = mongoose.model("Outbound", outboundSchema);
