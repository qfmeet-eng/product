const express = require("express");
const conditionRouter = express.Router();

const {
  addFavorite,
  removeFavorite,
  toggleFavorite,
  getUserFavorites,
  isFavorite,
} = require("../../controller/conditionController/conditionController");

// FAVORITE ROUTES
conditionRouter.post("/add", addFavorite);
conditionRouter.post("/remove", removeFavorite);  
conditionRouter.post("/toggle", toggleFavorite);
conditionRouter.get("/list/:userId", getUserFavorites);
conditionRouter.post("/check", isFavorite);

module.exports = conditionRouter;
