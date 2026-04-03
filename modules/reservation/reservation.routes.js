const express = require("express")
const router = express.Router()

const {verifyToken} = require("../../shared/middleware/jwt.middleware")
const RBC = require("../../shared/middleware/roleBased.middleware")
const Reservation = require("./reservation.controller")

router.post("/reserve/:orderId" , verifyToken , RBC("User") , Reservation.reserveOrder)

router.post("/confirm/:orderId" , verifyToken , RBC("User") , Reservation.confirmOrder)

router.post("/cancel/:orderId" , verifyToken , RBC("User") , Reservation.cancelOrder)

module.exports = router;