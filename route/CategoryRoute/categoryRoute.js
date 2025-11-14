const express = require("express")
const { createCategory, getAllCategoryByPagination, getCategoryDropdown, getCategoryById, deleteCategory, updateCategory } = require("../../controller/categoryController/categoryController")

const categoryRoute = express.Router()

categoryRoute.post("/createCategory",createCategory)
categoryRoute.post("/getAllCategory",getAllCategoryByPagination)
categoryRoute.get("/dropdownCategory", getCategoryDropdown)
categoryRoute.get("/getCategoryById/:id",getCategoryById)
categoryRoute.put("/updateCategory/:id",updateCategory)
categoryRoute.delete("/deleteCategory/:id",deleteCategory)

module.exports = categoryRoute
        