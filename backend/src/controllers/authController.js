const { validationResult } = require("express-validator");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const {
  generateToken,
  setTokenCookie,
  clearTokenCookie,
} = require("../utils/generateToken");

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const registerUser = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { name, email, password } = req.body;

    // Create case-insensitive regex for email check
    const emailRegex = new RegExp(`^${email}$`, "i");

    // Check if user already exists (case-insensitive)
    const userExists = await User.findOne({ email: emailRegex });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      // Create audit log for registration
      await AuditLog.create({
        user: user._id,
        action: "user-register",
        entity: "user",
        entityId: user._id,
        details: {
          name: user.name,
          email: user.email,
        },
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });

      // Generate JWT token
      const token = generateToken(user);

      // Set JWT in HTTP-only cookie
      setTokenCookie(res, token);

      // Return user data without password
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          notificationPreferences: user.notificationPreferences,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid user data",
      });
    }
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
const loginUser = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Create case-insensitive regex for email check
    const emailRegex = new RegExp(`^${email}$`, "i");

    // Find user using case-insensitive email matching
    const user = await User.findOne({ email: emailRegex }).select("+password");

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      // Create audit log for login
      await AuditLog.create({
        user: user._id,
        action: "user-login",
        entity: "user",
        entityId: user._id,
        details: {
          email: user.email,
        },
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });

      // Generate JWT token
      const token = generateToken(user);

      // Set JWT in HTTP-only cookie
      setTokenCookie(res, token);

      // Return user data without password
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          notificationPreferences: user.notificationPreferences,
        },
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Logout user / clear cookie
 * @route POST /api/auth/logout
 * @access Private
 */
const logoutUser = async (req, res) => {
  try {
    // Create audit log for logout
    if (req.user) {
      await AuditLog.create({
        user: req.user._id,
        action: "user-logout",
        entity: "user",
        entityId: req.user._id,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });
    }

    // Clear JWT cookie
    clearTokenCookie(res);

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          notificationPreferences: user.notificationPreferences,
        },
      });
    } else {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Update user profile
 * @route PUT /api/auth/me
 * @access Private
 */
const updateUserProfile = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const user = await User.findById(req.user._id);

    if (user) {
      // Update user fields if provided
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

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

      // Create audit log for profile update
      await AuditLog.create({
        user: user._id,
        action: "user-update",
        entity: "user",
        entityId: user._id,
        details: {
          updatedFields: Object.keys(req.body).filter(
            (key) => key !== "password"
          ),
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
    } else {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
};
