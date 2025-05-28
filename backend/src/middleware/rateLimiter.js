const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");
const { redis } = require("../config/redis");
const config = require("../config/environments");

// Create different limiters for different endpoints
const createLimiter = (options) => {
  const defaultOptions = {
    windowMs: config.security.rateLimitWindow,
    max: config.security.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: "Too many requests, please try again later.",
      });
    },
  };

  // Use Redis store if available
  if (redis) {
    defaultOptions.store = new RedisStore({
      client: redis,
      prefix: "rate-limit:",
    });
  }

  return rateLimit({ ...defaultOptions, ...options });
};

// Different rate limiters for different endpoints
const limiters = {
  // Strict limit for auth endpoints
  auth: createLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    skipSuccessfulRequests: false,
  }),

  // More lenient for general API
  api: createLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }),

  // Very strict for password reset
  passwordReset: createLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    skipSuccessfulRequests: true,
  }),

  // File upload limiter
  fileUpload: createLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
  }),
};

module.exports = limiters;
