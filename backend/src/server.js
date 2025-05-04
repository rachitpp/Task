const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const userRoutes = require("./routes/userRoutes");
const { initTaskScheduler } = require("./utils/taskScheduler");

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
        console.log("Socket.io blocked origin:", origin);
        callback(null, true); // Allow all origins temporarily to debug
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Store active user connections
const userSockets = new Map();

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("New client connected");

  // Handle user authentication for socket
  socket.on("authenticate", (userId) => {
    userSockets.set(userId, socket.id);
    console.log(`User ${userId} authenticated with socket ${socket.id}`);

    // Join user to their private room
    socket.join(`user:${userId}`);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected");

    // Remove user from socket map
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        break;
      }
    }
  });
});

// Make io accessible to routes
app.set("io", io);
app.set("userSockets", userSockets);

// Security headers
app.use(helmet());

// Parse cookies
app.use(cookieParser());

// Parse JSON body
app.use(express.json());

// Parse URL-encoded body
app.use(express.urlencoded({ extended: false }));

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
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
        console.log("Blocked origin:", origin);
        callback(null, true); // Consider switching this to true temporarily if still getting errors
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// Define routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);

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
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = { app, server, io };
