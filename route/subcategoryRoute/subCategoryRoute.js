const express = require("express")
const { createSubCategory, getAllSubCategory, getSubcategory, updateSubCategory, deleteSubCategory, getSubCategoryByDropDown } = require("../../controller/subCategoryController/subCategory")
const { getAllCategoryByPagination } = require("../../controller/categoryController/categoryController")

const sCategoryRoute = express.Router()

sCategoryRoute.post("/createsSubCategory",createSubCategory)
sCategoryRoute.post("/getAllsCategory",getAllCategoryByPagination)
sCategoryRoute.get("/getSubCategoryDrop",getSubCategoryByDropDown)
sCategoryRoute.get("/getSubCategoryById/:id",getSubcategory)
sCategoryRoute.put("/updateSubCategory/:id",updateSubCategory)
sCategoryRoute.delete("/deleteSubCategory/:id",deleteSubCategory)

module.exports =sCategoryRoute