Current Rate Limits:

  1. Authentication (login): 5 attempts per 15 minutes
  2. Password Reset: 3 attempts per hour
  3. Email Verification: 3 requests per 15 minutes
  4. File Upload: 10 uploads per 15 minutes
  5. Comments: 10 comments per 15 minutes
  6. Likes: 20 per minute
  7. General API: 100 requests per 15 minutes (1000 in dev)
  8. Registration: 5 per hour

  To Change Rate Limits:

  Edit /backend/src/middleware/enhancedRateLimiter.js:

  // Example: Make authentication stricter
  authentication: createRateLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 3, // Change from 5 to 3 attempts
      message: "Too many login attempts. Please try again in 15 minutes.",
  }),

  // Example: Allow more API requests
  generalApi: createRateLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 200, // Change from 100 to 200
      message: "Too many requests. Please try again in 15 minutes."
  }),

  Environment-based Configuration:

  You can also use environment variables in your .env file:

  generalApi: createRateLimiter({
      windowMs: 15 * 60 * 1000,
      max: process.env.RATE_LIMIT_GENERAL || 100,
      message: "Too many requests. Please try again in 15 minutes."
  }),

  Then in .env:
  RATE_LIMIT_GENERAL=200

  The rate limiting also includes account lockout after failed login attempts (locks for 30 minutes after too many failures).