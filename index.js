const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const db = require("./db/db.js");
const userRouter = require("./route/getUserRoute.js");

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:3000",  
  credentials: true,                
}));

 
app.use("/user", userRouter);

 
const PORT =  8000;
app.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`));
