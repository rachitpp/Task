const redis = require("redis");
const { promisify } = require("util");
const logger = require("./logger");

// Create Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    connectTimeout: 10000, // 10 seconds
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        // Stop reconnecting after 10 attempts
        logger.error("Redis reconnection failed after 10 attempts");
        return new Error("Redis reconnection failed");
      }
      // Reconnect after retries * 100ms
      return Math.min(retries * 100, 3000);
    },
  },
});

// Promisify Redis commands
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);
const delAsync = promisify(redisClient.del).bind(redisClient);
const expireAsync = promisify(redisClient.expire).bind(redisClient);

// Handle Redis errors
redisClient.on("error", (err) => {
  logger.error("Redis connection error", {
    error: err.message,
    stack: err.stack,
  });
});

// Handle Redis connection
redisClient.on("connect", () => {
  logger.info("Connected to Redis");
});

// Handle Redis reconnection
redisClient.on("reconnecting", () => {
  logger.info("Reconnecting to Redis");
});

// Handle Redis ready state
redisClient.on("ready", () => {
  logger.info("Redis client ready");
});

// Handle Redis end
redisClient.on("end", () => {
  logger.info("Redis connection ended");
});

/**
 * Get data from cache
 * @param {string} key - Cache key
 * @returns {Promise<object|null>} - Cached data or null
 */
const getCache = async (key) => {
  try {
    const data = await getAsync(key);
    if (data) {
      logger.debug(`Cache hit for key: ${key}`);
      return JSON.parse(data);
    }
    logger.debug(`Cache miss for key: ${key}`);
    return null;
  } catch (error) {
    logger.error("Redis getCache error", {
      key,
      error: error.message,
      stack: error.stack,
    });
    return null;
  }
};

/**
 * Set data in cache
 * @param {string} key - Cache key
 * @param {object} data - Data to cache
 * @param {number} ttl - Time to live in seconds (default: 1 hour)
 */
const setCache = async (key, data, ttl = 3600) => {
  try {
    await setAsync(key, JSON.stringify(data));
    await expireAsync(key, ttl);
    logger.debug(`Cache set for key: ${key}, TTL: ${ttl}s`);
  } catch (error) {
    logger.error("Redis setCache error", {
      key,
      ttl,
      error: error.message,
      stack: error.stack,
    });
  }
};

/**
 * Delete cache by key
 * @param {string} key - Cache key
 */
const deleteCache = async (key) => {
  try {
    await delAsync(key);
    logger.debug(`Cache deleted for key: ${key}`);
  } catch (error) {
    logger.error("Redis deleteCache error", {
      key,
      error: error.message,
      stack: error.stack,
    });
  }
};

/**
 * Clear cache by pattern (e.g. 'user:*')
 * @param {string} pattern - Key pattern to match
 */
const clearCachePattern = async (pattern) => {
  try {
    const keys = await promisify(redisClient.keys).bind(redisClient)(pattern);
    if (keys.length > 0) {
      await delAsync(keys);
      logger.debug(
        `Cache cleared for pattern: ${pattern}, keys: ${keys.length}`
      );
    }
  } catch (error) {
    logger.error("Redis clearCachePattern error", {
      pattern,
      error: error.message,
      stack: error.stack,
    });
  }
};

module.exports = {
  redisClient,
  getCache,
  setCache,
  deleteCache,
  clearCachePattern,
};
