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
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isDelete: false }).select("name email createdAt updatedAt");

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully.",
      data: users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching users.",
    });
  }
};


const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, isActive } = req.body;

    const user = await User.findOne({ _id: id, isDelete: false });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Update name
    if (name) user.name = name;

    // Update email
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email, isDelete: false });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "This email is already in use.",
        });
      }
      user.email = email;
    }

    // Update password
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    // 👍 FIX: Update Active Status
    if (typeof isActive !== "undefined") {
      user.isActive = isActive;
    }

    user.updatedAt = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      data: user,
    });

  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating user.",
    });
  }
};



const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({ _id: id, isDelete: false });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found or already deleted.",
      });
    }

    user.isDelete = true;
    user.deleteAt = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while deleting the user.",
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ _id: id, isDelete: false }).select("name email isActive createdAt updatedAt");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    return res.status(200).json({ success: true, message: "User found", data:{id:user._is,name: user.name,email:user.email} });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch user" });
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


module.exports = {getUserById, registration,updateUser,getAllUsers, deleteUser,login, getCurrentUser };
