const mongoose = require("mongoose");
const binSchema = new mongoose.Schema(
  {
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    binCode : {
        type : String,
        unique : true,
        required : true,
    },
    zone : {
        type : String,
        required : true,
    },
    rack : {
        type : String,
        required : true,
    },
    shelf : {
        type : String,
        required : true,
    }
  },
  { timestamps: true },
);

module.exports = mongoose.model("Bin", binSchema);
