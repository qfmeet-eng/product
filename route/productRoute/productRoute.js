const express = require("express")
const { createProduct, getAllProducts, getProductById, getProductDropdown, updateProduct, deleteProduct } = require("../../controller/productController/porductController")

const productRouter = express.Router()

productRouter.post("/createProduct",createProduct)
productRouter.post("/getAllProduct",getAllProducts)
productRouter.get("/getProductById",getProductById)
productRouter.get("/getData", getProductDropdown)
productRouter.put("/updateProduct", updateProduct)
productRouter.delete("/deleteProduct", deleteProduct)


module.exports = productRouter