const mongoose = require("mongoose");
const Category = require("../../model/categoryModel/categoryModel");
const SubCategory = require("../../model/subCategoryModel/subCatetgoryModel");
const Product = require("../../model/productModel/productModel");
const yup = require("yup");

// YUP VALIDATIONS
const objectId = yup
  .string()
  .test("is-objectid", "Invalid ID format", (value) =>
    mongoose.Types.ObjectId.isValid(value)
  );

const createProductSchema = yup.object({
  name: yup.string().trim().required("Product name is required"),
  categoryId: objectId.required("Category ID is required"),
  subCategoryId: objectId.required("SubCategory ID is required"),
  image: yup.string().required("Product image is required"),
  prise: yup
    .number()
    .typeError("Price must be a number")
    .positive("Price must be greater than 0")
    .required("Product price is required"),
});

const updateProductSchema = yup.object({
  name: yup.string().trim(),
  categoryId: objectId,
  subCategoryId: objectId,
  image: yup.string(),
  prise: yup.number().typeError("Price must be a number").positive("Price must be greater than 0"),
  isActive: yup.boolean(),
});


// CREATE PRODUCT
exports.createProduct = async (req, res) => {
  try {
    await createProductSchema.validate(req.body, { abortEarly: false });
    const { name, categoryId, subCategoryId, image, prise } = req.body;

    const category = await Category.findOne({ _id: categoryId, isDelete: false });
    if (!category)
      return res.status(404).json({ success: false, message: "Category not found or deleted" });

    const subCategory = await SubCategory.findOne({
      _id: subCategoryId,
      categoryId,
      isDelete: false,
    });

    if (!subCategory)
      return res.status(404).json({
        success: false,
        message: "SubCategory not found or deleted",
      });

    const existingProduct = await Product.findOne({
      name: { $regex: `^${name.trim()}$`, $options: "i" },
      categoryId,
      subCategoryId,
      isDelete: false,
    });

    if (existingProduct)
      return res.status(400).json({ success: false, message: "Product already exists" });

    const product = await Product.create({
      name: name.trim(),
      categoryId,
      subCategoryId,
      image,
      prise,
      createdAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors,
      });
    }

    return res.status(500).json({
      success: false,
      message: `Create Product error: ${error.message}`,
    });
  }
};




// GET ALL PRODUCTS WITH PAGINATION
exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find({ isDelete: false })
      .populate("categoryId", "name")
      .populate("subCategoryId", "name")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalData = await Product.countDocuments({ isDelete: false });
    const totalPage = Math.ceil(totalData / limit);

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      page,
      totalData,
      totalPage,
      currentDataPage: products.length,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Get Products error: ${error.message}`,
    });
  }
};


// GET PRODUCT BY ID
exports.getProductById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid Product ID" });

    const product = await Product.findOne({
      _id: req.params.id,
      isDelete: false,
    })
      .populate("categoryId", "name")
      .populate("subCategoryId", "name");
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};



// UPDATE PRODUCT
 exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid Product ID" });
    await updateProductSchema.validate(req.body, { abortEarly: false });

    const { name, categoryId, subCategoryId, image, prise, isActive } = req.body;

    const product = await Product.findOne({ _id: id, isDelete: false });
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found or deleted" });

    if (name?.trim()) product.name = name.trim();
    if (image) product.image = image;
    if (prise) product.prise = prise;
    if (isActive !== undefined) product.isActive = isActive;

    if (categoryId) {
      const category = await Category.findOne({ _id: categoryId, isDelete: false });

      if (!category)
        return res.status(404).json({ success: false, message: "Category not found" });

      product.categoryId = categoryId;
    }

    if (subCategoryId) {
      const subCategory = await SubCategory.findOne({
        _id: subCategoryId,
        categoryId: categoryId || product.categoryId,
        isDelete: false,
      });

      if (!subCategory)
        return res.status(404).json({
          success: false,
          message: "SubCategory not found or does not belong to category",
        });

      product.subCategoryId = subCategoryId;
    }

    product.updatedAt = new Date();
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors,
      });
    }

    return res.status(500).json({
      success: false,
      message: `Update Product error: ${error.message}`,
    });
  }
};


// DELETE PRODUCT (SOFT DELETE)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid Product ID" });

    const product = await Product.findOne({ _id: id, isDelete: false });
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found or already deleted" });

    product.isDelete = true;
    product.deletedAt = new Date();
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Delete Product error: ${error.message}`,
    });
  }
};



// PRODUCT DROPDOWN
exports.getProductDropdown = async (req, res) => {
  try {
    const products = await Product.find({ isDelete: false })
      .populate("categoryId", "name")
      .populate("subCategoryId", "name");

      return res.status(200).json({
      success: true,
      message: "Products fetched for dropdown",
      data: products.map((p) => ({
        id: p._id,
        name: p.name,
        category: { id: p.categoryId._id, name: p.categoryId.name },
        subCategory: { id: p.subCategoryId._id, name: p.subCategoryId.name },
      })),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Dropdown error: ${error.message}`,
    });
  }
};
