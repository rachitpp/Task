const { validationResult } = require("express-validator");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const {
  generateToken,
  setTokenCookie,
  clearTokenCookie,
} = require("../utils/generateToken");
const { getCache, setCache, deleteCache } = require("../utils/cacheManager");

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

    // Check if user already exists (using case-insensitive index)
    const userExists = await User.findOne({ email }).collation({
      locale: "en",
      strength: 2,
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Check if this is the first user in the system and if first-user-admin is enabled
    const userCount = await User.countDocuments({});
    const isFirstUser = userCount === 0;
    const firstUserAsAdmin = process.env.FIRST_USER_ADMIN === "true";

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      // If this is the first user and first-user-admin is enabled, make them an admin
      role: isFirstUser && firstUserAsAdmin ? "admin" : "user",
    });

    // Generate token
    const token = generateToken(user);

    // Set JWT in HTTP-only cookie
    setTokenCookie(res, token);

    // Create audit log asynchronously
    const auditLogPromise = AuditLog.create({
      user: user._id,
      action: "user-register",
      entity: "user",
      entityId: user._id,
      details: {
        email: user.email,
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    }).catch((err) => console.error("Audit log creation error:", err));

    // Return user data
    res.status(201).json({
      success: true,
      token: token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
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

    // Find user using the case-insensitive index (no need for regex anymore)
    const user = await User.findOne({ email })
      .select("+password")
      .collation({ locale: "en", strength: 2 });

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      // Generate JWT token
      const token = generateToken(user);

      // Set JWT in HTTP-only cookie
      setTokenCookie(res, token);

      // Create audit log for login asynchronously (don't await)
      const auditLogPromise = AuditLog.create({
        user: user._id,
        action: "user-login",
        entity: "user",
        entityId: user._id,
        details: {
          email: user.email,
        },
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      }).catch((err) => console.error("Audit log creation error:", err));

      // Return user data without password immediately without waiting for audit log
      res.json({
        success: true,
        token: token,
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
    // Clear JWT cookie
    clearTokenCookie(res);

    // Create audit log for logout asynchronously
    if (req.user) {
      const userId = req.user._id.toString();

      // Delete user cache on logout
      const deleteCachePromise = deleteCache(`user:profile:${userId}`);

      // Create audit log asynchronously
      const auditLogPromise = AuditLog.create({
        user: req.user._id,
        action: "user-logout",
        entity: "user",
        entityId: req.user._id,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      }).catch((err) => console.error("Audit log creation error:", err));

      // No need to await these operations
    }

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
    const userId = req.user._id.toString();
    const cacheKey = `user:profile:${userId}`;

    // Try to get user from cache first
    const cachedUser = await getCache(cacheKey);

    if (cachedUser) {
      return res.json({
        success: true,
        data: cachedUser,
        source: "cache",
      });
    }

    // If not in cache, get from database
    const user = await User.findById(userId);

    if (user) {
      // Format user data
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        notificationPreferences: user.notificationPreferences,
      };

      // Cache the user data for 15 minutes (900 seconds)
      await setCache(cacheKey, userData, 900);

      res.json({
        success: true,
        data: userData,
        source: "database",
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

      // Create audit log for profile update asynchronously
      const auditLogPromise = AuditLog.create({
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
      }).catch((err) => console.error("Audit log creation error:", err));

      // Delete user cache to ensure fresh data on next fetch
      const userId = user._id.toString();
      await deleteCache(`user:profile:${userId}`);

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
