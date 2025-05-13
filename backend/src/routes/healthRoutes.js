const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const os = require("os");
const {
  getMemoryUsage,
  getCpuUsage,
  getUptime,
} = require("../utils/systemMonitor");

/**
 * @route GET /api/health
 * @desc Basic health check endpoint
 * @access Public
 */
router.get("/", (req, res) => {
  res.status(200).json({
    status: "UP",
    timestamp: new Date().toISOString(),
  });
});

/**
 * @route GET /api/health/details
 * @desc Detailed health check with system information
 * @access Public
 */
router.get("/details", async (req, res) => {
  try {
    // Check database connection
    const dbStatus =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    // Get system information
    const memoryUsage = getMemoryUsage();
    const cpuUsage = getCpuUsage();
    const systemUptime = getUptime();

    // Get process uptime
    const processUptime = Math.floor(process.uptime());
    const uptimeFormatted = {
      days: Math.floor(processUptime / 86400),
      hours: Math.floor((processUptime % 86400) / 3600),
      minutes: Math.floor((processUptime % 3600) / 60),
      seconds: Math.floor(processUptime % 60),
    };

    res.status(200).json({
      status: "UP",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "unknown",
      database: {
        status: dbStatus,
        name: mongoose.connection.name || "unknown",
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        version: os.release(),
        memory: memoryUsage.system,
        cpu: cpuUsage,
        uptime: systemUptime,
      },
      process: {
        nodeVersion: process.version,
        pid: process.pid,
        memory: memoryUsage.process,
        uptime: `${uptimeFormatted.days}d ${uptimeFormatted.hours}h ${uptimeFormatted.minutes}m ${uptimeFormatted.seconds}s`,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @route GET /api/health/db
 * @desc Check database connectivity
 * @access Public
 */
router.get("/db", async (req, res) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: "DOWN",
        component: "database",
        message: "Database disconnected",
        timestamp: new Date().toISOString(),
      });
    }

    // Perform a simple ping to verify database responsiveness
    const start = Date.now();
    await mongoose.connection.db.admin().ping();
    const responseTime = Date.now() - start;

    res.status(200).json({
      status: "UP",
      component: "database",
      name: mongoose.connection.name,
      host: mongoose.connection.host,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: "DOWN",
      component: "database",
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
