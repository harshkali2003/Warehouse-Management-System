const express = require("express");
const router = express.Router()

const {verifyToken} = require("../../shared/middleware/jwt.middleware")
const roleBasedAccess = require("../../shared/middleware/roleBased.middleware")
const Location = require("./location.controller")

router.post("/" , verifyToken , roleBasedAccess("admin" , "manager") , Location.createLocation)

router.get("/location/:warehouseId" , verifyToken , roleBasedAccess("admin" , "manager") , Location.getLocationByWarehouse)

router.get("/location/:parentId/child" , verifyToken , roleBasedAccess("admin" , "manager") , Location.getChildrenByParent)

module.exports = router;