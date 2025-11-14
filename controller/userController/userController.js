  const bcrypt = require("bcrypt");
const genToken = require("../../token/token.js");
const yup = require("yup");
const User = require("../../model/userModel/model.js");

const tokenExpiryDate = () => new Date(Date.now() +24 * 60 * 60 * 1000);

const registerSchema = yup.object().shape({
  name: yup.string().min(3, "Name must be at least 3 characters long").required("Name is required"),
  email: yup.string().email("Please enter a valid email address").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters long").required("Password is required"),
});

const loginSchema = yup.object().shape({
  email: yup.string().email("Please enter a valid email address").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters long").required("Password is required"),
});


const registration = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    await registerSchema.validate({ name, email, password }, { abortEarly: false });

    const userExists = await User.findOne({ email, isDelete: false });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered. Please log in instead.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const token = genToken({ name, email });
    const tokenExpire = tokenExpiryDate();

    await User.create({
      name,
      email,
      password: passwordHash,
      token,
      tokenExpire,
      createdAt: new Date(),
      updatedAt: null,
      deleteAt: null,
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful!  ",
      data: { name, email, token },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
 
      return res.status(400).json({
        success: false,
        message: error.errors
    
      });
    }

    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating your account. Please try again later.",
    });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    await loginSchema.validate({ email, password }, { abortEarly: false });

    const user = await User.findOne({ email, isDelete: false });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No account found with this email. Please register first.",
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password. please give a valid password.",
      });
    }

    const token = genToken({ email });
    const tokenExpire = tokenExpiryDate();
    user.token = token;
    user.tokenExpire = tokenExpire;
    await user.save();

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
        
    });

    return res.status(200).json({
      success: true,
      message: "Login successful! Welcome back.",
      data: { name: user.name, email: user.email, token },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      
      return res.status(400).json({
        success: false,
        message: error.errors,
        
      });
    }

    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while logging in. Please try again later.",
    });
  }
};


const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated. Please log in again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User profile loaded successfully.",
      data: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch user information at the moment. Please try again later.",
    });
  }
};


module.exports = { registration, login, getCurrentUser };
