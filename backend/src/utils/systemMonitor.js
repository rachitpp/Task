const os = require("os");
const logger = require("./logger");

/**
 * Format bytes to human-readable format
 * @param {number} bytes - Bytes to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted string
 */
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

/**
 * Get memory usage statistics
 * @returns {Object} - Memory usage statistics
 */
const getMemoryUsage = () => {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memUsagePercent = Math.round((usedMem / totalMem) * 100);

  // Get Node.js process memory usage
  const processMemory = process.memoryUsage();

  return {
    system: {
      total: formatBytes(totalMem),
      free: formatBytes(freeMem),
      used: formatBytes(usedMem),
      percentUsed: memUsagePercent,
    },
    process: {
      rss: formatBytes(processMemory.rss), // Resident Set Size - total memory allocated for the process
      heapTotal: formatBytes(processMemory.heapTotal), // V8 heap allocated
      heapUsed: formatBytes(processMemory.heapUsed), // V8 heap used
      external: formatBytes(processMemory.external), // C++ objects bound to JavaScript
      arrayBuffers: formatBytes(processMemory.arrayBuffers || 0), // ArrayBuffers and SharedArrayBuffers
    },
  };
};

/**
 * Get CPU usage statistics
 * @returns {Object} - CPU usage statistics
 */
const getCpuUsage = () => {
  const cpus = os.cpus();
  const cpuCount = cpus.length;
  const cpuModel = cpus[0].model;
  const cpuSpeed = cpus[0].speed;

  // Calculate average CPU usage across all cores
  let totalIdle = 0;
  let totalTick = 0;

  cpus.forEach((cpu) => {
    for (const type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  });

  const idlePercent = (totalIdle / totalTick) * 100;
  const usedPercent = 100 - idlePercent;

  return {
    model: cpuModel,
    cores: cpuCount,
    speed: `${cpuSpeed} MHz`,
    percentUsed: Math.round(usedPercent),
  };
};

/**
 * Get system uptime
 * @returns {string} - Formatted uptime
 */
const getUptime = () => {
  const uptime = os.uptime();
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

/**
 * Start system monitoring
 * @param {number} interval - Monitoring interval in milliseconds
 */
const startMonitoring = (interval = 300000) => {
  // Default: every 5 minutes
  // Log initial system info
  const initialInfo = {
    platform: os.platform(),
    arch: os.arch(),
    hostname: os.hostname(),
    release: os.release(),
    uptime: getUptime(),
  };

  logger.info("System information", initialInfo);

  // Start monitoring at regular intervals
  setInterval(() => {
    const memoryUsage = getMemoryUsage();
    const cpuUsage = getCpuUsage();

    logger.info("System resources", {
      memory: memoryUsage,
      cpu: cpuUsage,
      uptime: getUptime(),
      loadAvg: os.loadavg(),
    });

    // Alert on high memory usage
    if (memoryUsage.system.percentUsed > 85) {
      logger.warn("High system memory usage detected", {
        memoryUsed: memoryUsage.system.percentUsed + "%",
      });
    }

    // Alert on high process memory usage
    const heapUsedBytes = process.memoryUsage().heapUsed;
    const heapTotalBytes = process.memoryUsage().heapTotal;
    const heapUsedPercent = Math.round((heapUsedBytes / heapTotalBytes) * 100);

    if (heapUsedPercent > 85) {
      logger.warn("High Node.js heap usage detected", {
        heapUsed: heapUsedPercent + "%",
      });
    }
  }, interval);

  logger.info(`System monitoring started, interval: ${interval}ms`);
};

module.exports = {
  startMonitoring,
  getMemoryUsage,
  getCpuUsage,
  getUptime,
};
