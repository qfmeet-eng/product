const express = require("express");
const router = express.Router();
const { registration, login, getCurrentUser } = require("../../controller/userController/userController.js");
const isAuth = require("../../middleware/isAuth.js")

router.post("/register"  ,registration);
router.post("/login", login)
router.get("/getCurrentProfile",isAuth, getCurrentUser)

 
module.exports = router;    
