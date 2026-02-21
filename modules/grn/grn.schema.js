const mongoose = require("mongoose");
const grnSchema = new mongoose.Schema(
  {
    inbound_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inbound",
      required: true,
    },
    receive_items: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        expected_quantity: {
          type: Number,
          required: true,
          min : 1,
        },
        received_quantity: {
          type: Number,
          required: true,
          min : 1,
        },
        batch: [
          {
            batch_code: {
              type: String,
              required: true,
            },
            manufacturing_date: {
              type: Date,
              required: true,
            },
            expiry_date: {
              type: Date,
              required: true,
            },
            quantity: {
              type: Number,
              required: true,
              min : 1,
            },
          },
        ],
      },
    ],
    status: {
      type: String,
      enum: ["RECEIVED", "CLOSED"],
      default: "RECEIVED",
    },
  },
  { timestamps: true },
);

grnSchema.index(
  {
    inbound_id: 1,
    "received_items.product_id": 1,
    "received_items.batch.batch_code": 1,
  },
  { unique: true },
);

module.exports = mongoose.model("GRN", grnSchema);
