const User = require("../models/User");
const bcrypt = require("bcryptjs");

// CREATE USER -> only ADMIN / SUB_ADMIN should use this route
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, userType, isActive } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "USER",
      userType: userType || "RENTER",
      isActive: isActive !== undefined ? isActive : true,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while creating user",
      error: error.message,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const { search, role, status } = req.query;

    let query = {};

    // 🔐 Role restriction
    if (req.user.role !== "ADMIN" && req.user.role !== "SUB_ADMIN") {
      query._id = req.user.id;
    }

    // 🔍 Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // 👤 Role filter
    if (role && role !== "ALL") {
      query.role = role;
    }

    // 🟢 Status filter
    if (status && status !== "ALL") {
      query.isActive = status === "ACTIVE";
    }

    const total = await User.countDocuments(query);

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-password");

    res.status(200).json({
      success: true,
      total,
      page,
      limit,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error while fetching users",
      error: error.message,
    });
  }
};
// GET SINGLE USER
exports.getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role === "USER" && req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: "You can access only your own profile",
      });
    }

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while fetching single user",
      error: error.message,
    });
  }
};

// UPDATE USER
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role === "USER" && req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: "You can update only your own profile",
      });
    }

    let updateData = { ...req.body };

    // USER apna role aur isActive change nahi karega
    if (req.user.role === "USER") {
      delete updateData.role;
      delete updateData.isActive;
    }

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while updating user",
      error: error.message,
    });
  }
};

// DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role === "USER" && req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own profile",
      });
    }

    if (req.user.role === "SUB_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Sub-Admin is not allowed to delete users",
      });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: deletedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while deleting user",
      error: error.message,
    });
  }
};

// CHANGE USER ROLE -> only ADMIN should use this route
exports.changeUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    const validRoles = ["ADMIN", "SUB_ADMIN", "USER"];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.role = role;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while changing user role",
      error: error.message,
    });
  }
};
