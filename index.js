const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const db = require("./db/db.js");
const userRouter = require("./route/userRoute/getUserRoute.js");
const categoryRoute = require("./route/CategoryRoute/categoryRoute.js");
const sCategoryRoute = require("./route/subcategoryRoute/subCategoryRoute.js");
const productRouter = require("./route/productRoute/productRoute.js");
const conditionRouter = require("./route/condition/condition.js");

const app = express();

// MIDDLEWARE
app.use(express.json());
app.use(cookieParser());

// CORS IS USE FULL TO CONNECTION FRONTEND AND BACKEND
app.use(cors({
  origin: "http://localhost:3000",  
  credentials: true,                
}));

//UPLOADS 
app.use("/uploads", express.static("uploads"));
  

// ALL ROUTER
app.use("/user", userRouter);
app.use("/category", categoryRoute  )
app.use("/subCategory",sCategoryRoute)
app.use("/product",productRouter)
app.use("/condition",conditionRouter)
const PORT =  8000;
app.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`));
