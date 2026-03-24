const express = require("express");
const app = express();

function errorHandler(err , req , resp , next) {
    console.log(err.message);
    
    const statusCode = err.statusCode || 500;
    resp.status(statusCode).json({
        success : false,
        message : err.message || "Internal server error",
        ...(process.env.NODE_ENV === "development" && {stack : err.stack}),
    })
}

module.exports = errorHandler;