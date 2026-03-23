const mongoose = require("mongoose");
const stockMovement = new mongoose.Schema({
    productId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Products",
        required : true,
    },
    batchId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Batch",
        required : true,
    },
    fromBinId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Bin",
        required : true,
    },
    toBinId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Bin",
        required : true,
    },
    quantity : {
        type : Number,
        required : true,
    },
    movementType : {
        type : String,
        enum : ["TRANSFER" , "INBOUND" , "OUTBOUND"],
        required : true,
    },
    referenceId : {
        type : mongoose.Schema.Types.ObjectId,
    } ,
    referenceType : {
        type : String,
        enum : ["ORDER" , "TRANSFER" , "EXPIRED" , 'PURCHASE']
    },
    note : {
        type : String,
    },
})

module.exports = mongoose.model("StockMovement" , stockMovement);