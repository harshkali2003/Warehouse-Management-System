const mongoose = require("mongoose");

const inventorySchema = require("../modules/inventory/inventory.schema")
const stockLodge = require("../modules/inventory/stcokLog.schema")
const binSchema = require("../modules/bin/bin.schema")

async function validateStock({sku_id , batch_id , bin_id , receivedItem}){
    const session = mongoose.startSession();
    try{
        (await session).startTransaction();

        const inventory = await inventorySchema.findOneAndUpdate(
            {skuId : sku_id , binId : bin_id , batchId : batch_id},
            {$inc : {quantity : receivedItem}},
            {upsert : true , new : true , session}
        )

        await stockLodge.create([
            {inventoryId : inventory._id , quantity : receivedItem , type : "IN" , },
        ] , {session})

        await binSchema.updateOne(
            {_id : bin_id},
            {$inc : {used_capacity : receivedItem}},
            {session}
        )

        (await session).commitTransaction();
    } catch(err){
        (await session).abortTransaction();
        console.log(err);
        throw new err;
    } finally{
        (await session).endSession();
    }
}

module.exports = {validateStock};