const mongoose = require("mongoose");
const inventorySchema = new mongoose.Schema({
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
    quantity : {
        type : Number,
        required : true,
        min : 1,
    },
    binId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Bin",
        required : true,
    }
} , {timestamps : true});

inventorySchema.index({productId : 1 , binId : 1 , batchId : 1} , {unique : true});

module.exports = mongoose.model("Inventory" , inventorySchema);