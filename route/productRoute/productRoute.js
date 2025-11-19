const express = require("express")
const { createProduct, getAllProducts, getProductById, getProductDropdown, updateProduct, deleteProduct, getAllProductByPagination } = require("../../controller/productController/porductController")

const upload  = require("../../multer/multer");
const productRouter = express.Router()
productRouter.post("/createProduct", upload.single("image") ,createProduct)
productRouter.post("/getAllProduct",getAllProductByPagination)
productRouter.get("/getProductById/:id",getProductById)
productRouter.get("/getData", getProductDropdown)
productRouter.put("/updateProduct/:id", upload.single("image"), updateProduct)
productRouter.delete("/deleteProduct/:id", deleteProduct)


module.exports = productRouter