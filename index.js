require("dotenv").config();

const connectDB = require("./config/db.config");
connectDB();

const express = require("express");
const app = express();

const globalErrorHandler = require("./shared/middleware/errorHandler.middleware");
const AppError = require("./shared/utils/GlobalError");
const asyncHandler = require("./shared/utils/AsyncWrapper")

const Inventory = require("./modules/inventory/inventory.routes")
const Product = require("./modules/product/product.routes")
const Warehouse = require("./modules/warehouse/warehouse.routes")
const Location = require("./modules/warehouse/location.routes")

app.use(express.json());

app.use("/test" , asyncHandler(async (req , resp) => {
    throw new AppError("Error" , 400);
}))

app.use("/inventory" , Inventory)
app.use("/product" , Product)
app.use("/warehouse" , Warehouse)
app.use("/location" , Location)

app.all("*" , (req , resp , next) => {
    return next(new AppError(`Invalid given route ${req.originalUrl}` , 404))
})

app.use(globalErrorHandler);

app.listen(process.env.PORT || 5000 , () => {
    console.log(`Server is listining at ${process.env.PORT}`);
})