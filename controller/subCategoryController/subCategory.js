const mongoose = require("mongoose");
const yup = require("yup");

const SubCategory = require("../../model/subCategoryModel/subCatetgoryModel.js");
const Category = require("../../model/categoryModel/categoryModel.js");

// YUP VALIDATION
const subCategoryValidation = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required("Subcategory name is required")
    .min(2, "Subcategory name must be at least 2 characters"),
  categoryId: yup
    .string()
    .required("Category ID is required")
    .test(
      "is-valid-objectid",
      "Invalid Category ID",
      value => mongoose.Types.ObjectId.isValid(value)
    )
});

// CREATE SUBCATEGORY
exports.createSubCategory = async (req, res) => {
  try {
    await subCategoryValidation.validate(req.body, { abortEarly: false });
    const { name, categoryId } = req.body;
    const formattedName = name.trim();
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists || categoryExists.isDelete) {
      return res.status(404).json({ success:false,message: "Category not found" });
    }
    const subCategoryExists = await SubCategory.findOne({
      name: { $regex: `^${formattedName}$`, $options: "i" },
      categoryId,
      isDelete: false
    });

    if (subCategoryExists) {
      return res.status(400).json({
         success:false,
        message: "This subcategory already exists under the selected category"
      });
    }
    const data = await SubCategory.create({
      name: formattedName,
      categoryId,
      isDelete: false,
      createdAt: new Date(),
      updatedAt: null,
      deletedAt: null
    });

    return res.status(200).json({
       success:true,
      message: "Subcategory created successfully",
      data: {
        id: data._id,
        name: data.name,
        categoryId: data.categoryId
      }
    });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return res.status(400).json({ message: error.errors });
    }
    return res.status(500).json({ message: `Create error: ${error.message}` });
  }
};

// GET SUBCATEGORY BY PAGINATION
exports.getAllSubCategoryByPagination = async (req, res) => {
  try {
    let page = Number(req.body.page) || 1;
    let limit = Number(req.body.limit) || 10;
    const search = req.body.q?.toLowerCase() || "";

    const skip = (page - 1) * limit;

    const query = {
      isDelete: false,
      ...(search && {
        $or: [{ name: { $regex: search, $options: "i" } }]
      })
    };

    const total = await SubCategory.countDocuments(query);

    const subcategory = await SubCategory.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Subcategories fetched successfully.",
      total,
      page,
      totalPages: Math.ceil(total / limit),
      perPage: limit,
      data: subcategory.map(item => ({
        id: item._id,
        name: item.name,
        isActive: item.isActive,
               categoryId: { 
   id: item.categoryId._id, 
   name: item.categoryId.name 
}

      }))
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to load subcategories. Please try again."
    });
  }
};


// DROPDOWN   
exports.getSubCategoryByDropDown = async (req, res) => {
  try {
    const subcategory = await SubCategory.find({ isDelete: false }).populate("categoryId");

    return res.status(200).json({
      success: true,
      message: "Subcategories fetched successfully.",
      data: subcategory.map(item => ({
        id: item._id,
        name: item.name,
        isActive: item.isActive,
   categoryId: { 
   id: item.categoryId._id, 
   name: item.categoryId.name 
}

      }))
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to load subcategories"
    });
  }
};


// GET SUBCATEGORY BY ID
exports.getSubcategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id).populate("categoryId", "name");
    if (!subCategory || subCategory.isDelete) {
      return res.status(404).json({ success: false, message: "Subcategory not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Subcategory fetched successfully.",
      data: {
        id: subCategory._id,
        name: subCategory.name,
        isActive: subCategory.isActive,
        categoryId: {
          id: subCategory.categoryId._id,
          name: subCategory.categoryId.name
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Get data by ID error: ${error.message}` });
  }
};
  


// UPDATE SUBCATEGORY
exports.updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const updateValidation = yup.object().shape({
      name: yup.string().trim().min(2, "Name must be at least 2 characters").optional(),
      categoryId: yup
        .string()
        .test(
          "is-valid-objectid",
          "Invalid Category ID",
          value => !value || mongoose.Types.ObjectId.isValid(value)
        )
        .optional(),
      isActive: yup.boolean().optional()  
    });

    await updateValidation.validate(req.body, { abortEarly: false });

    const { name, categoryId, isActive } = req.body;

    const subCategory = await SubCategory.findById(id);
    if (!subCategory || subCategory.isDelete) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    if (name) {
      const formattedName = name.trim();

      const exists = await SubCategory.findOne({
        name: { $regex: `^${formattedName}$`, $options: "i" },
        _id: { $ne: id },
        isDelete: false
      });

      if (exists) {
        return res.status(400).json({ message: "Subcategory name already exists" });
      }

      subCategory.name = formattedName;
    }

    // Update category
    if (categoryId) {
      const categoryExists = await Category.findById(categoryId);
      if (!categoryExists || categoryExists.isDelete) {
        return res.status(404).json({ message: "Category not found" });
      }
      subCategory.categoryId = categoryId;
    }

    if (typeof isActive === "boolean") {
      subCategory.isActive = isActive;
    }

    subCategory.updatedAt = new Date();
    await subCategory.save();

    return res.status(200).json({
      success: true,
      message: "Subcategory updated successfully.",
      data: {
        id: subCategory._id,
        name: subCategory.name,
        isActive: subCategory.isActive,
        categoryId: subCategory.categoryId
      }
    });

  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return res.status(400).json({ message: error.errors });
    }
    return res.status(500).json({ message: `Update error: ${error.message}` });
  }
};



// DELETE SUBCATEGORY
exports.deleteSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id);
    if (!subCategory || subCategory.isDelete) {
      return res.status(404).json({
        message: "Subcategory not found or already deleted"
      });
    }
    subCategory.isDelete = true;
    subCategory.deletedAt = new Date();
    await subCategory.save();

    return res.status(200).json({
      success: true,
      message: "Subcategory deleted successfully."
    });
  } catch (error) {
    return res.status(500).json({ message: `Delete error: ${error.message}` });
  }
};
