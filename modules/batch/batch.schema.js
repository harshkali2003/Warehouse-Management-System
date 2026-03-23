const mongoose = require("mongoose");
const bacthSchema = new mongoose.Schema({
    productId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Products",
        required : true,
    },
    manf_date : {
        type : Date,
    },
    exp_date : {
        type : Date,
    },
    batchCode : {
        type : String,
        unique : true,
        required : true,
    },
} , {timestamps : true});

module.exports = mongoose.model("Batch" , bacthSchema);