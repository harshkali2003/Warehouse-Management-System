const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
    p_name : {
        type : String,
        required : true,
    },
    p_category : {
        type : String,
        required : true,
    },
    p_price : {
        type : Number,
        required : true,
    },
    createdBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true,
    }
} , {timestamps : true}
)

module.exports = mongoose.model("Products" , productSchema);