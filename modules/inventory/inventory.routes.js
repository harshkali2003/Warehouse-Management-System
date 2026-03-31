const express = require("express");
const router = express.Router();

const {verifyToken} = require("../../shared/middleware/jwt.middleware")
const RBC = require("../../shared/middleware/roleBased.middleware")

const Inventory = require("./inventory.controller")

router.post("/inbound" , verifyToken , RBC("admin") , Inventory.createInventory)

router.get("/stock" , verifyToken , RBC("admin" , "manager") , Inventory.getInventory)

router.patch("/stocks/:id" , verifyToken , RBC("admin") , Inventory.updateInventory)

router.patch("/reserved/:id" , verifyToken , RBC("admin") , Inventory.reserveStock)

router.patch("/release/:id" , verifyToken , RBC("admin") , Inventory.releaseStock)

module.exports = router;