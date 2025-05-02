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
router.put("/profile", updateCurrentUser);

// Manager routes
// GET /api/users/team - Get team members (manager and admin)
// Note: This route must come before /:id routes to avoid conflicts
router.get("/team", authorize("admin", "manager"), getTeamMembers);

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

module.exports = router;
