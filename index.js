require("dotenv").config();

const connectDB = require("./config/db.config");
connectDB();

const express = require("express");
const app = express();

const globalErrorHandler = require("./shared/middleware/errorHandler.middleware");
const AppError = require("./shared/utils/GlobalError");
const asyncHandler = require("./shared/utils/AsyncWrapper")

app.use(express.json());

app.use("/test" , asyncHandler(async (req , resp) => {
    throw new AppError("Error" , 400);
}))

app.use("*" , (req , resp , next) => {
    return next(new AppError(`Invalid given route ${req.originalUrl}` , 404))
})

app.use(globalErrorHandler);

app.listen(process.env.PORT || 5000 , () => {
    console.log(`Server is listining at ${process.env.PORT}`);
})