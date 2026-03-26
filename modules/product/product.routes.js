const express = require("express")
const router = express.Router()

const {verifyToken} = require("../../shared/middleware/jwt.middleware")
const allowedRoles = require("../../shared/middleware/roleBased.middleware")
const Product = require("./product.conrotller")

router.post("/" , verifyToken , allowedRoles("admin") , Product.createProduct)

router.get("/" , Product.getAllProducts)

router.get("/info/:id" , Product.getSingleProduct)

router.put("/:id" , verifyToken , allowedRoles("admin") , Product.editProduct)

router.delete("/:id" , verifyToken , allowedRoles("admin") , Product.deleteProduct)

module.exports = router;