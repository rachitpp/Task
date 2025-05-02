const express = require("express");
const { body } = require("express-validator");
const {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/authController");
const { protect, logUserAction } = require("../middleware/authMiddleware");

const router = express.Router();

// Register user
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Please include a valid email"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/\d/)
      .withMessage("Password must contain a number")
      .matches(/[A-Z]/)
      .withMessage("Password must contain an uppercase letter"),
  ],
  registerUser
);

// Login user
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please include a valid email"),
    body("password").exists().withMessage("Password is required"),
  ],
  loginUser
);

// Logout user
router.post(
  "/logout",
  protect,
  logUserAction("user-logout", "user"),
  logoutUser
);

// Get user profile
router.get("/me", protect, getUserProfile);

// Update user profile
router.put(
  "/me",
  protect,
  [
    body("name").optional().notEmpty().withMessage("Name cannot be empty"),
    body("email")
      .optional()
      .isEmail()
      .withMessage("Please include a valid email"),
    body("password")
      .optional()
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/\d/)
      .withMessage("Password must contain a number")
      .matches(/[A-Z]/)
      .withMessage("Password must contain an uppercase letter"),
    body("notificationPreferences.email")
      .optional()
      .isBoolean()
      .withMessage("Email notification preference must be a boolean"),
    body("notificationPreferences.inApp")
      .optional()
      .isBoolean()
      .withMessage("In-app notification preference must be a boolean"),
  ],
  logUserAction("user-update", "user"),
  updateUserProfile
);

module.exports = router;
