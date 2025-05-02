const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");

// Define role permissions
const rolePermissions = {
  admin: [
    "user:read",
    "user:write",
    "user:delete",
    "task:read",
    "task:write",
    "task:delete",
    "task:assign",
    "task:manage-all",
    "reports:view",
    "system:settings",
  ],
  manager: [
    "user:read",
    "task:read",
    "task:write",
    "task:delete",
    "task:assign",
    "task:manage-team",
    "reports:view",
  ],
  user: ["task:read", "task:write", "task:assign", "task:manage-own"],
};

/**
 * Helper function to check if a user has a specific permission
 */
const hasPermission = (userRole, permission) => {
  if (!userRole || !rolePermissions[userRole]) {
    return false;
  }
  return rolePermissions[userRole].includes(permission);
};

/**
 * Middleware to protect routes and verify token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    // Check for token in cookies
    else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from the token
    const user = await User.findById(decoded.id).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    // Set user in request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
};

/**
 * Middleware to restrict access based on roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }

    next();
  };
};

/**
 * Middleware to check for specific permissions
 */
const checkPermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, please login",
      });
    }

    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every((permission) =>
      req.user.permissions.includes(permission)
    );

    if (!hasAllPermissions) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to perform this action",
      });
    }

    next();
  };
};

/**
 * Log user actions
 */
const logUserAction = (action, entity) => {
  return async (req, res, next) => {
    const originalSend = res.send;

    res.send = async function (data) {
      res.send = originalSend;

      // Only log successful operations
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        try {
          const entityId =
            req.params.id || (entity === "user" ? req.user._id : null);

          if (entityId) {
            await AuditLog.create({
              user: req.user._id,
              action,
              entity,
              entityId,
              details: {
                method: req.method,
                url: req.originalUrl,
                body: req.body,
              },
              ipAddress: req.ip,
              userAgent: req.headers["user-agent"],
            });
          }
        } catch (error) {
          console.error("Audit logging error:", error);
        }
      }

      return res.send(data);
    };

    next();
  };
};

// Check specific permissions based on resource ownership
const checkOwnership = (model) => async (req, res, next) => {
  try {
    const resourceId = req.params.id;
    const userId = req.user._id;

    // If user is admin, allow access without checking ownership
    if (req.user.role === "admin") {
      return next();
    }

    // Find the resource
    const resource = await model.findById(resourceId);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    // Check if user is the creator or the resource is assigned to the user
    const isCreator =
      resource.creator && resource.creator.toString() === userId.toString();
    const isAssignee =
      resource.assignedTo &&
      resource.assignedTo.toString() === userId.toString();

    // Manager can access resources they created or that are assigned to users
    if (req.user.role === "manager") {
      return next();
    }

    // Regular users can only access their own resources or resources assigned to them
    if (!isCreator && !isAssignee) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this resource",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while checking resource ownership",
    });
  }
};

// Export all middleware functions
module.exports = {
  protect,
  authorize,
  checkPermission,
  hasPermission,
  logUserAction,
  rolePermissions,
  checkOwnership,
};
