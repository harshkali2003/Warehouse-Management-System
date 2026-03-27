const mongoose = require("mongoose");
const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["ZONE", "RACK" , "BIN"],
      default: "ZONE",
      required: true,
    },
    warehouse_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  { timestamps: true },
);

locationSchema.index({warehouse_id : 1 , parent_id : 1} , {unique : true})

module.exports = mongoose.model("Location", locationSchema);
