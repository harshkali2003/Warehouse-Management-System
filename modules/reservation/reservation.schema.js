const mongoose = require("mongoose");
const reservationSchema = new mongoose.Schema({
    orderId : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
    },
    productId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Product",
        required : true,
    },
    batchId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Batch",
        required : true,
    },
    binId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Bin",
        required : true,
    },
    quantity : {
        type : Number,
        required : true,
        min : 0,
    },
    status : {
        type : String,
        enum : ["RESERVED" , "CONFIRMED" , "RELEASED"],
        default : "RESERVED",
        required : true,
    },
    expiresAt : {
        type : Date,
        required : true,
    },
} , {timestamps : true})

reservationSchema.index({expiresAt : 1} , {expireAfterSeconds : 0})

module.exports = mongoose.model("Reservation" , reservationSchema)