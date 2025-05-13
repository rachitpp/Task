const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const compression = require("compression");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const {
  globalLimiter,
  authLimiter,
  apiLimiter,
} = require("./middleware/rateLimitMiddleware");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const userRoutes = require("./routes/userRoutes");
const healthRoutes = require("./routes/healthRoutes");
const { initTaskScheduler } = require("./utils/taskScheduler");
const mongoose = require("mongoose");
const logger = require("./utils/logger");
const systemMonitor = require("./utils/systemMonitor");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = socketio(server, {
  cors: {
    origin: function (origin, callback) {
      const allowedOrigins = [
        "https://task1-iota-olive.vercel.app",
        "https://task2-azure-beta.vercel.app",
        "https://task-management2-six.vercel.app",
        "http://localhost:3000",
      ];

      // Allow requests with no origin
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        logger.warn(`Socket.io blocked origin: ${origin}`);
        callback(null, true); // Allow all origins temporarily to debug
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["content-type", "authorization"],
  },
  // Increase timeouts and configure transport
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ["websocket", "polling"],
  allowUpgrades: true,
  upgradeTimeout: 10000,
  cookie: false,
});

// Store active user connections
const userSockets = new Map();

// Socket.io connection handling
io.on("connection", (socket) => {
  logger.debug(`New socket client connected: ${socket.id}`);

  // Check for token in socket handshake
  const token = socket.handshake.auth.token;
  if (token) {
    logger.debug("Socket connection has auth token");
  } else {
    logger.debug("No auth token in socket connection");
  }

  // Handle user authentication for socket
  socket.on("authenticate", (userId) => {
    // Log authentication attempt
    logger.debug(`Socket auth attempt for user ${userId}`);

    userSockets.set(userId, socket.id);
    logger.debug(`User ${userId} authenticated with socket ${socket.id}`);

    // Join user to their private room
    socket.join(`user:${userId}`);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    logger.debug(`Socket client disconnected: ${socket.id}`);

    // Remove user from socket map
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        logger.debug(`Removed user ${userId} from socket map`);
        break;
      }
    }
  });
});

// Make io accessible to routes
app.set("io", io);
app.set("userSockets", userSockets);

// Enhanced security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://via.placeholder.com"],
        connectSrc: ["'self'", "https://*.onrender.com"],
      },
    },
    xssFilter: true,
    noSniff: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    hsts: {
      maxAge: 15552000, // 180 days in seconds
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: "deny" },
    permittedCrossDomainPolicies: { permittedPolicies: "none" },
  })
);

// Compress all responses
app.use(
  compression({
    level: 6, // Default compression level is 6 (0-9, where 9 is maximum compression but slowest)
    threshold: 100 * 1024, // Only compress responses larger than 100KB
    filter: (req, res) => {
      // Don't compress responses with this header
      if (req.headers["x-no-compression"]) {
        return false;
      }
      // Use compression filter function from the module
      return compression.filter(req, res);
    },
  })
);

// Parse cookies
app.use(cookieParser());

// Parse JSON body
app.use(express.json());

// Parse URL-encoded body
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use(logger.logApiRequest);

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev", { stream: logger.stream }));
}

// Enable CORS
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "https://task1-iota-olive.vercel.app",
        "https://task2-azure-beta.vercel.app",
        "https://task-management2-six.vercel.app",
        "http://localhost:3000",
      ];

      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked origin: ${origin}`);
        callback(null, true); // Consider switching this to true temporarily if still getting errors
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Apply global rate limiter to all requests
app.use(globalLimiter);

// Health check routes - no rate limiting for monitoring
app.use("/api/health", healthRoutes);

// Define routes with specific rate limiters
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/tasks", apiLimiter, taskRoutes);
app.use("/api/notifications", apiLimiter, notificationRoutes);
app.use("/api/users", apiLimiter, userRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Task Management System API",
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));

  // Any route that's not defined above will be redirected to the frontend
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../../frontend/dist", "index.html"));
  });
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Set the port
const PORT = process.env.PORT || 5000;

// Initialize task scheduler for recurring tasks
initTaskScheduler();

// Start the server
const serverInstance = server.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);

  // Start system monitoring
  systemMonitor.startMonitoring(
    process.env.MONITOR_INTERVAL
      ? parseInt(process.env.MONITOR_INTERVAL)
      : 300000
  ); // Default: 5 minutes
});

// Graceful shutdown function
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);

  // Close server first, stop accepting new connections
  serverInstance.close(() => {
    logger.info("HTTP server closed");

    // Close database connection
    mongoose.connection.close(false, () => {
      logger.info("MongoDB connection closed");

      // Close Redis connection if available
      if (require("./utils/cacheManager").redisClient) {
        try {
          require("./utils/cacheManager").redisClient.quit();
          logger.info("Redis connection closed");
        } catch (err) {
          logger.error("Error closing Redis connection:", err);
        }
      }

      logger.info("Shutdown complete");
      process.exit(0);
    });
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error(
      "Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 10000);
};

// Handle various signals for graceful shutdown
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Promise Rejection", {
    error: err.message,
    stack: err.stack,
  });
  // Don't exit immediately, try graceful shutdown
  gracefulShutdown("unhandledRejection");
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception", { error: err.message, stack: err.stack });
  // Don't exit immediately, try graceful shutdown
  gracefulShutdown("uncaughtException");
});

module.exports = { app, server, io };
