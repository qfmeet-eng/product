const Category = require("../../model/categoryModel/categoryModel");
const yup = require("yup");

// VALIDATION
const nameValidation = yup.object().shape({
  name: yup.string().trim().required("Category name is required.")
});

// CREATE CATEGORY
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    await nameValidation.validate({ name }, { abortEarly: false });

    const formattedName = name.trim();

    const categoryExists = await Category.findOne({
      name: { $regex: `^${formattedName}$`, $options: "i" },
      isDelete: false
    });

    if (categoryExists) {
      return res.status(400).json({
        success: false,
        message: "This category name is already taken."
      });
    }

    const newCategory = await Category.create({
      name: formattedName,
      isActive: true,
      createdAt: new Date(),
      updatedAt: null,
      deletedAt: null,
      isDelete: false
    });

    return res.status(200).json({
      success: true,
      message: "Category created successfully.",
      data: {
        id: newCategory._id,
        name: newCategory.name,
        
      }
    });

  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.errors
        
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again."
    });
  }
};


// GET ALL WITH PAGINATION
exports.getAllCategoryByPagination = async (req, res) => {
  try {
    let page = Number(req.body.page) || 1;
    let limit = Number(req.body.limit) || 10;
    const search = req.body.q?.toLowerCase() || "";

    let skip = (page - 1) * limit;

    const query = {
      isDelete: false,
      ...(search && {
        $or: [{ name: { $regex: search, $options: "i" } }]
      })
    };

    const total = await Category.countDocuments(query);

    const categories = await Category.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Categories get successFully.",
      total,
      page,
      totalPages: Math.ceil(total / limit),
      perPage: limit,
      data: categories.map(item => ({
        id: item._id,
        name: item.name,
        isActive: item.isActive
      }))
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to load categories. Please try again."
    });
  }
};


// DROPDOWN
exports.getCategoryDropdown = async (req, res) => {
  try {
    const categories = await Category.find({ isDelete: false });

    return res.status(200).json({
      success: true,
      message: "Categories get successFully.",
      data: categories.map(item => ({
        id: item._id,
        name: item.name,
        isActive: item.isActive
      }))
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to load categories."
    });
  }
};


// GET BY ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category || category.isDelete) {
      return res.status(404).json({
        success: false,
        message: "Category not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category id get.",
      data: {
        id: category._id,
        name: category.name,
        isActive: category.isActive
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again."
    });
  }
};


// DELETE
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category || category.isDelete) {
      return res.status(404).json({
        success: false,
        message: "Category not found."
      });
    }

    category.isDelete = true;
    category.deletedAt = new Date();
    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category deleted."
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to delete category. Please try again."
    });
  }
};


// UPDATE CATEGORY
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;

    const categoryData = await Category.findById(id);

    if (!categoryData || categoryData.isDelete) {
      return res.status(404).json({
        success: false,
        message: "Category not found."
      });
    }

    if (name !== undefined) {
      const formattedName = name.trim();

      if (formattedName.toLowerCase() !== categoryData.name.toLowerCase()) {
        const nameExists = await Category.findOne({
          name: { $regex: `^${formattedName}$`, $options: "i" },
          _id: { $ne: id },
          isDelete: false
        });

        if (nameExists) {
          return res.status(400).json({
            success: false,
            message: "This category name is already taken."
          });
        }

        categoryData.name = formattedName;
      }
    }

    if (isActive !== undefined) {
      categoryData.isActive = isActive;
    }

    categoryData.updatedAt = new Date();
    await categoryData.save();

    return res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      data: {
        id: categoryData._id,
        name: categoryData.name,
        isActive: categoryData.isActive
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to update category. Please try again."
    });
  }
};
