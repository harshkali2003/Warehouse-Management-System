const express = require("express");
const router = express.Router();

const skuController = require("./sku.controller");

router.post("/post" , skuController.postSKU)

router.get("/get" , skuController.getSKU);

router.put("/patch/:id" , skuController.updateSKU);

module.exports = router;