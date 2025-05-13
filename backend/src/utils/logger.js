const winston = require("winston");
const path = require("path");
const fs = require("fs");

// Create logs directory if it doesn't exist
const logDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: logFormat,
  defaultMeta: { service: "task-management-api" },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// If not in production, also log to console
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// Create a stream object for Morgan integration
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

// Helper function to log API requests
logger.logApiRequest = (req, res, next) => {
  const startHrTime = process.hrtime();

  // Once the request is finished
  res.on("finish", () => {
    const elapsedHrTime = process.hrtime(startHrTime);
    const elapsedTimeInMs =
      elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1000000;

    logger.info({
      type: "request",
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      responseTime: elapsedTimeInMs.toFixed(3),
      userAgent: req.headers["user-agent"],
      ip: req.ip,
      userId: req.user ? req.user._id : "unauthenticated",
    });
  });

  next();
};

// Helper function for structured error logging
logger.logError = (error, req = null) => {
  const errorLog = {
    message: error.message,
    stack: error.stack,
    type: error.name,
  };

  if (req) {
    errorLog.method = req.method;
    errorLog.url = req.originalUrl;
    errorLog.ip = req.ip;
    errorLog.userId = req.user ? req.user._id : "unauthenticated";
  }

  logger.error(errorLog);
};

module.exports = logger;
