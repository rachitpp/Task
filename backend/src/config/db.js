const mongoose = require("mongoose");
const logger = require("../utils/logger");

// Monitor MongoDB connection events
const monitorConnection = () => {
  // Connection events
  mongoose.connection.on("connected", () => {
    logger.info("MongoDB connection established");
  });

  mongoose.connection.on("error", (err) => {
    logger.error("MongoDB connection error", {
      error: err.message,
      stack: err.stack,
    });
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB connection disconnected");
  });

  mongoose.connection.on("reconnected", () => {
    logger.info("MongoDB connection reestablished");
  });

  // Monitor connection pool
  setInterval(() => {
    if (mongoose.connection.readyState === 1) {
      // Connected
      const poolStats = mongoose.connection.db
        .admin()
        .serverStatus()
        .then(
          (stats) => {
            if (stats && stats.connections) {
              logger.debug("MongoDB connection pool stats", {
                current: stats.connections.current,
                available: stats.connections.available,
                active: stats.connections.active,
                totalCreated: stats.connections.totalCreated,
              });
            }
          },
          (err) => {
            logger.error("Error getting MongoDB stats", { error: err.message });
          }
        );
    }
  }, 300000); // Every 5 minutes
};

const connectDB = async () => {
  try {
    // Connection options for better performance and reliability
    const options = {
      maxPoolSize: 50, // Maintain up to 50 socket connections
      minPoolSize: 10, // Maintain at least 10 socket connections
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
      serverSelectionTimeoutMS: 10000, // Server selection timeout
      heartbeatFrequencyMS: 10000, // How often to send heartbeat (ms)
      retryWrites: true, // Automatically retry failed writes
      retryReads: true, // Automatically retry failed reads
      w: "majority", // Write concern
      wtimeoutMS: 2500, // Write concern timeout
      autoIndex: process.env.NODE_ENV !== "production", // Don't build indexes in production
    };

    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Setup connection monitoring
    monitorConnection();

    // Log MongoDB version
    const admin = conn.connection.db.admin();
    const serverInfo = await admin.serverInfo();
    logger.info(`MongoDB version: ${serverInfo.version}`);
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`, {
      stack: error.stack,
    });
    process.exit(1);
  }
};

module.exports = connectDB;
