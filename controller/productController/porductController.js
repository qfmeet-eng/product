  const mongoose = require("mongoose");
  const Category = require("../../model/categoryModel/categoryModel");
  const SubCategory = require("../../model/subCategoryModel/subCatetgoryModel");
  const Product = require("../../model/productModel/productModel");
  const yup = require("yup");

  // YUP VALIDATIONS
const objectId = yup
  .string()
  .nullable()
  .test("is-objectid", "Invalid ID format", (value) => {
    if (!value) return true;  
    return mongoose.Types.ObjectId.isValid(value);
  });

const createProductSchema = yup.object({
  name: yup.string().trim().required("Product name is required"),
  categoryId: objectId.required("Category ID is required"),
  subCategoryId: objectId.required("SubCategory ID is required"),
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
  prise: yup
    .number()
    .typeError("Price must be a number")
    .positive("Price must be greater than 0"),
  isActive: yup.boolean(),
});



  // CREATE PRODUCT
  exports.createProduct = async (req, res) => {
    try {
      await createProductSchema.validate(req.body, { abortEarly: false });
      const { name, categoryId, subCategoryId, prise } = req.body;

      const image = req.file ? req.file.filename : null;

      const category = await Category.findOne({ _id: categoryId, isDelete: false });
      if (!category)
        return res.status(404).json({ success: false, message: "Category not found" });

      const subCategory = await SubCategory.findOne({
        _id: subCategoryId,
        categoryId,
        isDelete: false,
      });

      if (!subCategory)
        return res.status(404).json({ success: false, message: "SubCategory not found" });

      const existing = await Product.findOne({
        name: { $regex: `^${name.trim()}$`, $options: "i" },
        categoryId,
        subCategoryId,
        isDelete: false,
      });

      if (existing)
        return res.status(400).json({ success: false, message: "Product already exists" });

      const product = await Product.create({
        name: name.trim(),
        categoryId,
        subCategoryId,
        image,
        prise,
        createdAt: new Date(),
        deletedAt: null,
        updatedAt: null,
      });

      return res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: {
          id: product._id,
          name: product.name,
          categoryId: product.categoryId,
          subCategoryId: product.subCategoryId,
          prise: product.prise,
          image: product.image,
          isActive: product.isActive,
        },
      });
    } catch (error) {
      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: error.errors,
        });
      }

      return res.status(500).json({
        success: false,
        message: `Create Product error: ${error.message}`,
      });
    }
  };

  // GET ALL PRODUCTS - PAGINATION
  exports.getAllProductByPagination = async (req, res) => {
    try {
      let page = Number(req.query.page) || 1;
      let limit = Number(req.query.limit) || 10;
      const search = req.query.q ? req.query.q.toLowerCase() : "";

      let skip = (page - 1) * limit;

      const query = {
        isDelete: false,
        ...(search && {
          name: { $regex: search, $options: "i" },
        }),
      };

      const total = await Product.countDocuments(query);
      const products = await Product.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        message: "Products fetched successfully",
        total,
        page,
        totalPages: Math.ceil(total / limit),
        perPage: limit,
        data: products.map((item) => ({
          id: item._id,
          name: item.name,
          image: item.image,
          categoryId: item.categoryId,
          subCategoryId: item.subCategoryId,
          prise: item.prise,
          isActive: item.isActive,
        })),
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `${error}`,
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
        message: "Product fetched successfully",
        data: {
          id: product._id,
          name: product.name,
          prise: product.prise,
          image: product.image,
          isActive: product.isActive,
          category: product.categoryId,
          subCategory: product.subCategoryId,
        },
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  // UPDATE PRODUCT
  exports.updateProduct = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, categoryId, subCategoryId, prise, isActive } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ success: false, message: "Invalid Product ID" });

      await updateProductSchema.validate(req.body, { abortEarly: false });

      const image = req.file ? req.file.filename : undefined;

      const product = await Product.findOne({ _id: id, isDelete: false });
      if (!product)
        return res.status(404).json({ success: false, message: "Product not found" });

      if (name) product.name = name.trim();
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
            message: "SubCategory not found for selected category",
          });

        product.subCategoryId = subCategoryId;
      }

      product.updatedAt = new Date();
      await product.save();

      return res.status(200).json({
        success: true,
        message: "Product updated successfully",
         product,
      });
    } catch (error) {
      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: error.errors,
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
        message: "Products fetched successfully",
        data: products.map((p) => ({
          id: p._id,
          name: p.name,
          category: { id: p.categoryId._id, name: p.categoryId.name },
          subCategory: { id: p.subCategoryId._id, name: p.subCategoryId.name },
          prise: p.prise,
          isActive:p.isActive
        })),
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `Dropdown error: ${error.message}`,
      });
    }
  };
