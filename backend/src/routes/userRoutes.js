const express = require("express");
const { body } = require("express-validator");
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getCurrentUser,
  updateCurrentUser,
  getAllUsers,
  updateUserRole,
  getTeamMembers,
} = require("../controllers/userController");
const {
  protect,
  authorize,
  logUserAction,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes - none for users

// Protected routes - require authentication
router.use(protect);

// GET /api/users/profile - Get current user profile
router.get("/profile", getCurrentUser);

// PUT /api/users/profile - Update current user profile
router.put(
  "/profile",
  [
    body("email")
      .optional()
      .isEmail()
      .withMessage("Please include a valid email"),
    body("password")
      .optional()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  updateCurrentUser
);

// GET /api/users/team - Get team members (manager and admin only)
router.get("/team", authorize("admin", "manager"), getTeamMembers);

// GET /api/users/assignable - Get assignable users (all authenticated users)
router.get("/assignable", getTeamMembers);

// Admin only routes
// GET /api/users - Get all users (admin only)
router.get("/", authorize("admin"), getAllUsers);

// GET /api/users/:id - Get user by ID (admin only)
router.get("/:id", authorize("admin"), getUserById);

// PUT /api/users/:id - Update user (admin only)
router.put("/:id", authorize("admin"), updateUser);

// DELETE /api/users/:id - Delete user (admin only)
router.delete("/:id", authorize("admin"), deleteUser);

// PATCH /api/users/:id/role - Update user role (admin only)
router.patch("/:id/role", authorize("admin"), updateUserRole);

// Direct test endpoint without middleware
router.patch("/test/:id/role", async (req, res) => {
  try {
    console.log("TEST ENDPOINT: Update user role request received:", {
      userId: req.params.id,
      requestBody: req.body,
    });

    const { role } = req.body;

    // Basic role validation
    if (!role || !["user", "manager", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role value",
      });
    }

    // Find the user directly
    const User = require("../models/User");
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update the user role directly
    user.role = role;
    await user.save();

    console.log("TEST ENDPOINT: User role updated successfully:", {
      userId: user._id,
      newRole: role,
    });

    // Return success
    return res.json({
      success: true,
      message: "User role updated successfully (TEST ENDPOINT)",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("TEST ENDPOINT ERROR:", error);
    console.error("Error stack:", error.stack);

    return res.status(500).json({
      success: false,
      message: `Test endpoint error: ${error.message}`,
    });
  }
});

// Direct test endpoint for user deletion without middleware
router.delete("/test/:id", async (req, res) => {
  try {
    console.log("TEST ENDPOINT: Delete user request received:", {
      userId: req.params.id,
    });

    // Find the user directly
    const User = require("../models/User");
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent deletion of own account
    if (req.user && user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      });
    }

    // Delete the user directly
    await User.findByIdAndDelete(req.params.id);

    console.log("TEST ENDPOINT: User deleted successfully:", {
      userId: req.params.id,
    });

    // Return success
    return res.json({
      success: true,
      message: "User deleted successfully (TEST ENDPOINT)",
    });
  } catch (error) {
    console.error("TEST ENDPOINT ERROR (DELETE):", error);
    console.error("Error stack:", error.stack);

    return res.status(500).json({
      success: false,
      message: `Test endpoint error: ${error.message}`,
    });
  }
});

module.exports = router;
