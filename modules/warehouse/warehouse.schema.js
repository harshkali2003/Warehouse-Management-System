const mongoose = require("mongoose");
const warehouseSchema = new mongoose.Schema({
    w_name : {
        type : String,
        required : true,
    },
    code : {
        type : String,
        unique : true,
        required : true,
    },
    w_location : {
        type : {
            type : String,
            enum : ["Point"],
            required : true,
        },
        coordinates : {
            type : [Number],
            required : true,
        }
    }
} , {timestamps : true}
)

warehouseSchema.index({W_location : "2dsphere"})

module.exports = mongoose.model("Warehouse" , warehouseSchema);