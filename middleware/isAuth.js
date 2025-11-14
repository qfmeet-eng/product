const User = require("../model/userModel/model");

const isAuth = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token || req.headers?.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Token is not provided" });
    }

    const user = await User.findOne({ token, isDelete: false });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    if (!user.tokenExpire || new Date() > new Date(user.tokenExpire)) {
      return res.status(401).json({ success: false, message: "Token expired" });
    }

    req.user = user;  
    next();
  } catch (error) {
    console.error("isAuth error:", error);
    res
      .status(500)
      .json({ success: false, message: `Middleware error: ${error.message}` });
  }
};

module.exports = isAuth;
