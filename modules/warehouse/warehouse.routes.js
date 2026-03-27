const express = require("express");
const router = express.Router()

const {verifyToken} = require("../../shared/middleware/jwt.middleware")
const roleBasedAccess = require("../../shared/middleware/roleBased.middleware")
const Warehouse = require("./warehouse.controller")

router.post("/" , verifyToken , roleBasedAccess("admin" , "manager") , Warehouse.createWarehouse)

router.get("/" , verifyToken , roleBasedAccess("admin" , "manager") , Warehouse.getAll)

router.get("/warehouse/:id" , verifyToken , roleBasedAccess("admin" , "manager") , Warehouse.getInfoById)

module.exports = router;