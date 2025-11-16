const mongoose = require("mongoose");
const yup = require("yup");
const Favorite = require("../model/favoriteModel");
const Product = require("../model/productModel/productModel");

// YUP VALIDATION
const objectId = yup
  .string()
  .test("is-objectid", "Invalid ID", (value) =>
    mongoose.Types.ObjectId.isValid(value)
  );

const favoriteSchemaValidation = yup.object({
  userId: objectId.required("User ID is required"),
  productId: objectId.required("Product ID is required"),
});

// ADD FAVORITE
exports.addFavorite = async (req, res) => {
  try {
    await favoriteSchemaValidation.validate(req.body, { abortEarly: false });

    const { userId, productId } = req.body;

    const product = await Product.findOne({ _id: productId, isDelete: false });
    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });

    const exist = await Favorite.findOne({ userId, productId });

    if (exist) {
      exist.is_favorite = true;
      await exist.save();
      return res.status(200).json({
        success: true,
        message: "Product already exists — updated to favorite",
        data: exist,
      });
    }
    const favorite = await Favorite.create({ userId, productId });
    return res.status(201).json({
      success: true,
      message: "Product added to favorite",
      data: favorite,
    });
  } catch (error) {
    if (error.name === "ValidationError")
      return res.status(400).json({ success: false, errors: error.errors });

    return res.status(500).json({ success: false, message: error.message });
  }
};

// REMOVE FAVORITE
exports.removeFavorite = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const favorite = await Favorite.findOne({ userId, productId });
    if (!favorite)
      return res
        .status(404)
        .json({ success: false, message: "Favorite not found" });

    favorite.is_favorite = false;
    await favorite.save();

    return res
      .status(200)
      .json({ success: true, message: "Removed from favorite" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// TOGGLE FAVORITE 
exports.toggleFavorite = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    let favorite = await Favorite.findOne({ userId, productId });

    if (!favorite) {
      favorite = await Favorite.create({
        userId,
        productId,
        is_favorite: true,
      });
    } else {
      favorite.is_favorite = !favorite.is_favorite;
      await favorite.save();
    }
    return res.status(200).json({
      success: true,
      message: favorite.is_favorite
        ? "Added to favorite"
        : "Removed from favorite",
      data: favorite,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL FAVORITES OF USER
exports.getUserFavorites = async (req, res) => {
  try {
    const { userId } = req.params;
    const favorites = await Favorite.find({
      userId,
      is_favorite: true,
    }).populate("productId");
    return res.status(200).json({
      success: true,
      message: "Favorite products fetched",
      data: favorites,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// CHECK IF FAVORITE
exports.isFavorite = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    const favorite = await Favorite.findOne({
      userId,
      productId,
      is_favorite: true,
    });
    return res.status(200).json({
      success: true,
      isFavorite: !!favorite,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
