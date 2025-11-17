const express = require("express")
const { createProduct, getAllProducts, getProductById, getProductDropdown, updateProduct, deleteProduct, getAllProductByPagination } = require("../../controller/productController/porductController")

const productRouter = express.Router()

productRouter.post("/createProduct",createProduct)
productRouter.post("/getAllProduct",getAllProductByPagination)
productRouter.get("/getProductById/:id",getProductById)
productRouter.get("/getData", getProductDropdown)
productRouter.put("/updateProduct/:id", updateProduct)
productRouter.delete("/deleteProduct/:id", deleteProduct)


module.exports = productRouter