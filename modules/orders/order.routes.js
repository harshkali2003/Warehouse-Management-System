const express = require("express")
const router = express.Router()

const {verifyToken} = require("../../shared/middleware/jwt.middleware")
const RBC = require("../../shared/middleware/roleBased.middleware")
const Order = require("./order.controller")

router.post("/order" , verifyToken , RBC("User") , Order.createOrder)

router.post("/order/:orderId" , verifyToken , RBC("Admin" , "Manager") , Order.fulfillOrder)

module.exports = router;