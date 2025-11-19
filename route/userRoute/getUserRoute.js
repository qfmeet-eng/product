const express = require("express");
const router = express.Router();
const { registration, login, getCurrentUser, updateUser, deleteUser, getAllUsers, getUserById } = require("../../controller/userController/userController.js");
const isAuth = require("../../middleware/isAuth.js")

router.post("/register"  ,registration);
router.post("/login", login)
router.put("/updateUser/:id",updateUser)
router.get("/getUserById/:id" ,getUserById)
router.get("/getData", getAllUsers)
router.delete("/deleteUser/:id",deleteUser)
router.get("/getCurrentProfile",isAuth, getCurrentUser)
module.exports = router;