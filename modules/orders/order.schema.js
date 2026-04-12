const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "FULFILLED", "PARTIAL", "FAILED" , "OUT-OF-STOCK"],
      default: "PENDING",
    },
    items: {
      type: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
          },
          quantity: {
            type: Number,
            min: 1,
          },
          allocated: {
            type: Number,
            default: 0,
          },
        },
      ],
      required: true,
    },
  },
  { timestamps: true },
);

orderSchema.index({orderId : 1} , {unique : true})

module.exports = mongoose.model("Order", orderSchema);
