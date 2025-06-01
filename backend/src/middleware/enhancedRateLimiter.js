// backend/src/middleware/enhancedRateLimiter.js
const rateLimit = require("express-rate-limit");
const { logWarn, logError } = require("../utils/logger");

// In-memory store for failed login attempts (production should use Redis)
const failedAttempts = new Map();

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  for (const [key, data] of failedAttempts.entries()) {
    if (now - data.lastAttempt > oneHour) {
      failedAttempts.delete(key);
    }
  }
}, 60 * 60 * 1000);

// Custom key generator for login attempts (IP + email)
const loginKeyGenerator = (req) => {
  const ip = req.ip || req.connection.remoteAddress;
  const email = req.body?.email || 'unknown';
  return `${ip}:${email}`;
};

// Account lockout middleware for login attempts
const accountLockout = (req, res, next) => {
  const key = loginKeyGenerator(req);
  const now = Date.now();
  const attempt = failedAttempts.get(key) || { count: 0, lastAttempt: now, locked: false };
  
  // Check if account is locked
  if (attempt.locked && (now - attempt.lastAttempt < 30 * 60 * 1000)) { // 30 minutes lockout
    logWarn('Account lockout attempted access', { 
      ip: req.ip, 
      email: req.body?.email,
      lockoutTime: attempt.lastAttempt 
    });
    
    return res.status(429).json({
      success: false,
      message: "Account temporarily locked due to too many failed attempts. Please try again in 30 minutes.",
      lockedUntil: new Date(attempt.lastAttempt + 30 * 60 * 1000)
    });
  }
  
  // Reset if lockout period has expired
  if (attempt.locked && (now - attempt.lastAttempt >= 30 * 60 * 1000)) {
    failedAttempts.delete(key);
  }
  
  next();
};

// Track failed login attempts
const trackFailedLogin = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    const key = loginKeyGenerator(req);
    const now = Date.now();
    
    try {
      const response = typeof data === 'string' ? JSON.parse(data) : data;
      
      if (res.statusCode === 401 || (response && !response.success)) {
        // Failed login attempt
        const attempt = failedAttempts.get(key) || { count: 0, lastAttempt: now, locked: false };
        attempt.count += 1;
        attempt.lastAttempt = now;
        
        // Lock account after 5 failed attempts
        if (attempt.count >= 5) {
          attempt.locked = true;
          logWarn('Account locked due to failed attempts', { 
            ip: req.ip, 
            email: req.body?.email,
            attempts: attempt.count 
          });
        }
        
        failedAttempts.set(key, attempt);
        
        logWarn('Failed login attempt', { 
          ip: req.ip, 
          email: req.body?.email,
          attempts: attempt.count 
        });
      } else if (res.statusCode === 200 && response?.success) {
        // Successful login - reset counter
        failedAttempts.delete(key);
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

// Rate limiter configurations
const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logWarn('Rate limit exceeded', { 
        ip: req.ip, 
        endpoint: req.path,
        userAgent: req.get('User-Agent')
      });
      
      res.status(429).json({
        success: false,
        message: options.message || "Too many requests. Please try again later.",
        retryAfter: Math.ceil(options.windowMs / 1000)
      });
    },
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health' || req.path === '/api/health';
    }
  };

  return rateLimit({ ...defaultOptions, ...options });
};

// Different rate limiters for different endpoints
const rateLimiters = {
  // Very strict for authentication attempts
  authentication: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: "Too many login attempts. Please try again in 15 minutes.",
    keyGenerator: (req) => {
      // Combine IP and email for more targeted limiting
      return `auth:${req.ip}:${req.body?.email || 'unknown'}`;
    }
  }),

  // Strict for password operations
  passwordReset: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts per hour
    message: "Too many password reset attempts. Please try again in 1 hour.",
    skipSuccessfulRequests: true
  }),

  // Strict for email verification
  emailVerification: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // 3 verification emails per 15 minutes
    message: "Too many verification email requests. Please try again in 15 minutes."
  }),

  // File upload limiting
  fileUpload: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 uploads per 15 minutes
    message: "Too many file uploads. Please try again in 15 minutes."
  }),

  // Admin operations
  adminOperations: createRateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 20, // 20 admin operations per 5 minutes
    message: "Too many admin operations. Please try again in 5 minutes."
  }),

  // Comment creation
  commentCreation: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 comments per 15 minutes
    message: "Too many comments. Please try again in 15 minutes."
  }),

  // Like/unlike operations
  likeOperations: createRateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // 20 likes per minute
    message: "Too many like operations. Please slow down."
  }),

  // General API access
  generalApi: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 1000 : 100, // 1000 requests in development, 100 in production
    message: "Too many requests. Please try again in 15 minutes."
  }),

  // Registration attempts
  registration: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 registrations per hour per IP
    message: "Too many registration attempts. Please try again in 1 hour."
  }),

  // Contact form submissions
  contactForm: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 contact form submissions per hour
    message: "Too many contact form submissions. Please try again in 1 hour."
  })
};

// Progressive rate limiting for repeated offenders
const progressiveRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: (req) => {
    // More lenient in development
    if (process.env.NODE_ENV === 'development') {
      return 1000;
    }
    
    const clientId = req.ip;
    const violations = failedAttempts.get(`violations:${clientId}`)?.count || 0;
    
    // Reduce allowed requests based on violations
    if (violations > 10) return 10;
    if (violations > 5) return 25;
    if (violations > 2) return 50;
    return 100;
  },
  handler: (req, res) => {
    const clientId = req.ip;
    const key = `violations:${clientId}`;
    const violation = failedAttempts.get(key) || { count: 0, lastViolation: Date.now() };
    
    violation.count += 1;
    violation.lastViolation = Date.now();
    failedAttempts.set(key, violation);
    
    logError('Progressive rate limit violation', null, { 
      ip: req.ip, 
      violations: violation.count,
      endpoint: req.path
    });
    
    res.status(429).json({
      success: false,
      message: "Rate limit exceeded. Continued violations may result in extended restrictions.",
      violations: violation.count
    });
  }
});

module.exports = {
  rateLimiters,
  accountLockout,
  trackFailedLogin,
  progressiveRateLimit,
  createRateLimiter
};