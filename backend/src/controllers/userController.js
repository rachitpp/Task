const { validationResult } = require("express-validator");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");

/**
 * Get all users (admin only)
 * @route GET /api/users
 * @access Private/Admin
 */
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;

    // Build query
    const query = {};

    // Filter by role if provided
    if (role) {
      query.role = role;
    }

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Count total documents for pagination
    const totalUsers = await User.countDocuments(query);

    // Setup pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch users
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: users.length,
      total: totalUsers,
      totalPages: Math.ceil(totalUsers / parseInt(limit)),
      currentPage: parseInt(page),
      data: users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Get all users - Alternative function for new routes
 * @route GET /api/users
 * @access Private/Admin
 */
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;

    // Build query
    const query = {};

    // Filter by role if provided
    if (role) {
      query.role = role;
    }

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Count total documents for pagination
    const totalUsers = await User.countDocuments(query);

    // Setup pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch users
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: users.length,
      total: totalUsers,
      totalPages: Math.ceil(totalUsers / parseInt(limit)),
      currentPage: parseInt(page),
      data: users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Get current user's profile
 * @route GET /api/users/profile
 * @access Private
 */
const getCurrentUser = async (req, res) => {
  try {
    // User is already available in req.user from the protect middleware
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Update current user's profile
 * @route PUT /api/users/profile
 * @access Private
 */
const updateCurrentUser = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    // Find current user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user fields if provided
    user.name = req.body.name || user.name;

    // Email updates should be handled carefully
    if (req.body.email && req.body.email !== user.email) {
      // Check if email is already taken
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }
      user.email = req.body.email;
    }

    // Only update password if it's provided
    if (req.body.password) {
      user.password = req.body.password;
    }

    // Update notification preferences if provided
    if (req.body.notificationPreferences) {
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...req.body.notificationPreferences,
      };
    }

    // Save the updated user
    const updatedUser = await user.save();

    // Create audit log for user profile update
    await AuditLog.create({
      user: req.user._id,
      action: "user-profile-update",
      entity: "user",
      entityId: user._id,
      details: {
        updatedFields: Object.keys(req.body).filter(
          (key) => key !== "password"
        ),
        updatedBy: "self",
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    // Return updated user data
    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        notificationPreferences: updatedUser.notificationPreferences,
      },
    });
  } catch (error) {
    console.error("Update current user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Get user by ID
 * @route GET /api/users/:id
 * @access Private/Admin
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Update user role
 * @route PATCH /api/users/:id/role
 * @access Private/Admin
 */
const updateUserRole = async (req, res) => {
  try {
    console.log("Update user role request received:", {
      userId: req.params.id,
      requestBody: req.body,
      requestUser: req.user?._id,
    });

    const { role } = req.body;

    // Validate role
    if (!role || !["user", "manager", "admin"].includes(role)) {
      console.log("Invalid role provided:", role);
      return res.status(400).json({
        success: false,
        message: "Invalid role value",
      });
    }

    // Find the user
    const user = await User.findById(req.params.id);

    if (!user) {
      console.log("User not found with ID:", req.params.id);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admin from changing their own role
    if (user._id.toString() === req.user._id.toString()) {
      console.log("Admin attempting to change own role");
      return res.status(400).json({
        success: false,
        message: "Cannot change your own role",
      });
    }

    // Update the user role
    user.role = role;
    await user.save();

    console.log("User role updated successfully:", {
      userId: user._id,
      newRole: role,
    });

    // Create audit log for role update
    await AuditLog.create({
      user: req.user._id,
      action: "user-role-update",
      entity: "user",
      entityId: user._id,
      details: {
        previousRole: user.role,
        newRole: role,
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.json({
      success: true,
      message: "User role updated successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update user role error:", error);
    console.error("Error stack:", error.stack);

    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Get team members for managers
 * @route GET /api/users/team
 * @access Private/Manager&Admin
 */
const getTeamMembers = async (req, res) => {
  try {
    // Managers can only see users with 'user' role
    // Admins can see all users
    const query = req.user.role === "manager" ? { role: "user" } : {};

    const users = await User.find(query).select("-password").sort({ name: 1 });

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Get team members error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Update user by ID (admin only)
 * @route PUT /api/users/:id
 * @access Private/Admin
 */
const updateUser = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user fields if provided
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;

    // Only update password if it's provided
    if (req.body.password) {
      user.password = req.body.password;
    }

    // Update notification preferences if provided
    if (req.body.notificationPreferences) {
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...req.body.notificationPreferences,
      };
    }

    // Save the updated user
    const updatedUser = await user.save();

    // Create audit log for user update by admin
    await AuditLog.create({
      user: req.user._id,
      action: "user-update",
      entity: "user",
      entityId: user._id,
      details: {
        updatedFields: Object.keys(req.body).filter(
          (key) => key !== "password"
        ),
        updatedBy: "admin",
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    // Return updated user data
    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        notificationPreferences: updatedUser.notificationPreferences,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Delete user (admin only)
 * @route DELETE /api/users/:id
 * @access Private/Admin
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own admin account",
      });
    }

    // Create audit log for user deletion
    await AuditLog.create({
      user: req.user._id,
      action: "user-delete",
      entity: "user",
      entityId: user._id,
      details: {
        deletedUser: {
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    // Delete user
    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getCurrentUser,
  updateCurrentUser,
  getAllUsers,
  updateUserRole,
  getTeamMembers,
};
