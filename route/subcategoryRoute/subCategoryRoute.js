const express = require("express")
const { createSubCategory, getAllSubCategory, getSubcategory, updateSubCategory, deleteSubCategory, getSubCategoryByDropDown } = require("../../controller/subCategoryController/subCategory")

const sCategoryRoute = express.Router()

sCategoryRoute.post("/createsCategory",createSubCategory)
sCategoryRoute.post("/getAllsCategory",getAllSubCategory)
sCategoryRoute.get("/getSubCategoryDrop",getSubCategoryByDropDown)
sCategoryRoute.get("/getSubCategoryById/:id",getSubcategory)
sCategoryRoute.put("/updateSubCategory/:id",updateSubCategory)
sCategoryRoute.delete("/deleteSubCategory/:id",deleteSubCategory)

module.exports =sCategoryRoute