const jwt = require("jsonwebtoken");

/**
 * Generate a JWT token for authentication
 * @param {Object} user - The user object containing the ID
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || "task_management_jwt_secret_key",
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "30d",
    }
  );
};

/**
 * Set JWT token in HTTP-only cookie
 * @param {Object} res - Express response object
 * @param {string} token - JWT token
 */
const setTokenCookie = (res, token) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() +
        parseInt(process.env.COOKIE_EXPIRES_IN || "30") * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Cannot be accessed by client-side JS
    secure: process.env.NODE_ENV === "production", // Only sent over HTTPS in production
    sameSite: "none", // Allow cross-site cookies for different domains
    path: "/",
  };

  res.cookie("jwt", token, cookieOptions);
};

/**
 * Clear JWT cookie
 * @param {Object} res - Express response object
 */
const clearTokenCookie = (res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    path: "/",
  });
};

module.exports = { generateToken, setTokenCookie, clearTokenCookie };
