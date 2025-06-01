# Enhanced Rate Limiting Implementation

## Overview

The backend now implements comprehensive rate limiting to protect against brute force attacks, DoS attempts, and abuse. The rate limiting system includes multiple layers of protection with different limits for different types of operations.

## Rate Limiting Configuration

### Authentication Endpoints
- **Login Attempts**: 5 attempts per 15 minutes per IP+email combination
- **Registration**: 5 registrations per hour per IP
- **Password Reset**: 3 attempts per hour
- **Email Verification**: 3 verification emails per 15 minutes

### Content Operations
- **Comment Creation**: 10 comments per 15 minutes
- **Like Operations**: 20 likes per minute
- **File Uploads**: 10 uploads per 15 minutes

### Admin Operations
- **Admin Actions**: 20 operations per 5 minutes

### Contact & Communication
- **Contact Form**: 3 submissions per hour

### General API
- **General API**: 100 requests per 15 minutes

## Account Lockout System

### Failed Login Protection
- **Tracking**: Failed login attempts tracked by IP + email combination
- **Lockout Threshold**: Account locked after 5 failed attempts
- **Lockout Duration**: 30 minutes
- **Auto-Reset**: Successful login resets failed attempt counter

### Progressive Rate Limiting
- **Violation Tracking**: Repeated rate limit violations reduce allowed requests
- **Escalating Penalties**: 
  - 0-2 violations: 100 requests per window
  - 3-5 violations: 50 requests per window  
  - 6-10 violations: 25 requests per window
  - 10+ violations: 10 requests per window

## Security Features

### Request Monitoring
- **Logging**: All rate limit violations are logged with IP, endpoint, and user agent
- **Attack Detection**: Multiple violations from same IP are tracked
- **Suspicious Activity**: Account lockouts and violations are logged for monitoring

### Response Security
- **Standardized Responses**: All rate limit responses follow consistent format
- **No Information Disclosure**: Error messages don't reveal internal system details
- **Retry-After Headers**: Clients receive proper retry timing information

## Implementation Details

### Middleware Stack
1. **General API Rate Limit**: Applied to all routes (100 req/15min)
2. **Specific Endpoint Limits**: More restrictive limits for sensitive operations
3. **Account Lockout**: Pre-authentication check for locked accounts
4. **Failed Login Tracking**: Post-authentication tracking of failures

### Key Features
- **Memory-based Storage**: Uses in-memory Map for storing attempt counters
- **Automatic Cleanup**: Old entries cleaned up every hour
- **Health Check Exemption**: Rate limiting skipped for health check endpoints
- **Detailed Logging**: Comprehensive logging using Winston logger

## Rate Limit Responses

### Standard Rate Limit Response
```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "retryAfter": 900
}
```

### Account Lockout Response
```json
{
  "success": false,
  "message": "Account temporarily locked due to too many failed attempts. Please try again in 30 minutes.",
  "lockedUntil": "2024-01-01T12:30:00.000Z"
}
```

## Monitoring & Alerts

### Log Events
- Rate limit violations
- Account lockouts
- Progressive penalty escalations
- Suspicious activity patterns

### Metrics Tracked
- Failed login attempts per IP/email
- Rate limit violations per endpoint
- Account lockout frequency
- Progressive penalty escalations

## Configuration

Rate limiting can be adjusted by modifying the limits in `/src/middleware/enhancedRateLimiter.js`:

- **Authentication**: `rateLimiters.authentication`
- **Password Operations**: `rateLimiters.passwordReset`
- **File Uploads**: `rateLimiters.fileUpload`
- **Comments**: `rateLimiters.commentCreation`
- **Likes**: `rateLimiters.likeOperations`
- **Admin**: `rateLimiters.adminOperations`
- **Contact**: `rateLimiters.contactForm`
- **General**: `rateLimiters.generalApi`

## Production Considerations

### Redis Integration (Recommended)
For production deployments with multiple server instances, consider integrating Redis for shared rate limit storage:

```javascript
// In production, use Redis store
const RedisStore = require("rate-limit-redis");
const redis = require("redis");

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

// Add to rate limiter configuration
store: new RedisStore({
  client: redisClient,
  prefix: "rate-limit:"
})
```

### Monitoring Integration
Consider integrating with monitoring systems:
- **Application Performance Monitoring (APM)**
- **Security Information and Event Management (SIEM)**  
- **Log aggregation systems**

## Testing Rate Limits

### Manual Testing
Use tools like curl or Postman to test rate limits:

```bash
# Test login rate limiting
for i in {1..10}; do
  curl -X POST http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done
```

### Automated Testing
Rate limiting behavior should be included in integration tests to ensure proper functionality.