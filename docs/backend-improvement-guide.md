# Complete Backend Improvement Implementation Guide

## Table of Contents
1. [Project Structure Setup](#1-project-structure-setup)
2. [Security Implementation](#2-security-implementation)
3. [Service Layer Architecture](#3-service-layer-architecture)
4. [Repository Pattern](#4-repository-pattern)
5. [Error Handling System](#5-error-handling-system)
6. [Logging System](#6-logging-system)
7. [API Documentation](#7-api-documentation)
8. [Testing Framework](#8-testing-framework)
9. [Caching Layer](#9-caching-layer)
10. [Database Optimizations](#10-database-optimizations)

---

## 1. Project Structure Setup

### Recommended Directory Structure
```
backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── environments.js
│   │   ├── redis.js
│   │   └── swagger.js
│   ├── controllers/
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── cache.js
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── validator.js
│   ├── models/
│   ├── repositories/
│   │   ├── articleRepository.js
│   │   ├── userRepository.js
│   │   ├── commentRepository.js
│   │   └── baseRepository.js
│   ├── services/
│   │   ├── articleService.js
│   │   ├── authService.js
│   │   ├── commentService.js
│   │   └── emailService.js
│   ├── routes/
│   ├── utils/
│   │   ├── asyncHandler.js
│   │   ├── errors.js
│   │   ├── logger.js
│   │   └── validators.js
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── fixtures/
│   └── index.js
├── migrations/
├── seeders/
├── logs/
├── .env.example
├── .env.test
├── jest.config.js
└── package.json
```

### Step 1: Install Required Dependencies
```bash
# Core dependencies
npm install --save \
  express-rate-limit \
  express-validator \
  joi \
  winston \
  redis \
  ioredis \
  swagger-jsdoc \
  swagger-ui-express \
  compression \
  express-mongo-sanitize \
  xss \
  hpp

# Dev dependencies
npm install --save-dev \
  jest \
  supertest \
  @types/jest \
  eslint \
  eslint-config-airbnb-base \
  eslint-plugin-import \
  prettier \
  husky \
  lint-staged
```

---

## 2. Security Implementation

### 2.1 Environment Configuration

Create `backend/src/config/environments.js`:
```javascript
const joi = require('joi');

// Validation schema for environment variables
const envVarsSchema = joi.object({
  NODE_ENV: joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: joi.number().default(8080),
  
  // Database
  DB_HOST: joi.string().required(),
  DB_PORT: joi.number().default(3306),
  DB_USER: joi.string().required(),
  DB_PASSWORD: joi.string().required(),
  DB_NAME: joi.string().required(),
  DB_POOL_MAX: joi.number().default(20),
  DB_POOL_MIN: joi.number().default(5),
  
  // JWT
  JWT_SECRET: joi.string().min(32).required(),
  JWT_EXPIRE: joi.string().default('30d'),
  JWT_REFRESH_SECRET: joi.string().min(32).required(),
  JWT_REFRESH_EXPIRE: joi.string().default('90d'),
  
  // Redis
  REDIS_URL: joi.string().default('redis://localhost:6379'),
  
  // Email
  SMTP_HOST: joi.string(),
  SMTP_PORT: joi.number(),
  SMTP_USER: joi.string(),
  SMTP_PASS: joi.string(),
  
  // Security
  BCRYPT_ROUNDS: joi.number().default(10),
  RATE_LIMIT_WINDOW: joi.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: joi.number().default(100),
  
  // CORS
  CORS_ORIGIN: joi.string().default('http://localhost:3000'),
  
  // Logging
  LOG_LEVEL: joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info'),
}).unknown();

const { error, value: envVars } = envVarsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  
  database: {
    host: envVars.DB_HOST,
    port: envVars.DB_PORT,
    username: envVars.DB_USER,
    password: envVars.DB_PASSWORD,
    database: envVars.DB_NAME,
    pool: {
      max: envVars.DB_POOL_MAX,
      min: envVars.DB_POOL_MIN,
    },
  },
  
  jwt: {
    secret: envVars.JWT_SECRET,
    expiresIn: envVars.JWT_EXPIRE,
    refreshSecret: envVars.JWT_REFRESH_SECRET,
    refreshExpiresIn: envVars.JWT_REFRESH_EXPIRE,
  },
  
  redis: {
    url: envVars.REDIS_URL,
  },
  
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USER,
        pass: envVars.SMTP_PASS,
      },
    },
  },
  
  security: {
    bcryptRounds: envVars.BCRYPT_ROUNDS,
    rateLimitWindow: envVars.RATE_LIMIT_WINDOW,
    rateLimitMax: envVars.RATE_LIMIT_MAX,
  },
  
  cors: {
    origin: envVars.CORS_ORIGIN,
    credentials: true,
  },
  
  logging: {
    level: envVars.LOG_LEVEL,
  },
};

module.exports = config;
```

### 2.2 Rate Limiting Middleware

Create `backend/src/middleware/rateLimiter.js`:
```javascript
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { redis } = require('../config/redis');
const config = require('../config/environments');

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
        message: 'Too many requests, please try again later.',
      });
    },
  };

  // Use Redis store if available
  if (redis) {
    defaultOptions.store = new RedisStore({
      client: redis,
      prefix: 'rate-limit:',
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
```

### 2.3 Input Validation Middleware

Create `backend/src/middleware/validator.js`:
```javascript
const { validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));
    
    throw new ValidationError('Validation failed', extractedErrors);
  }
  next();
};

// Joi validation middleware
const validateSchema = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }
    
    req.body = value;
    next();
  };
};

module.exports = { validate, validateSchema };
```

### 2.4 Security Headers and Middleware

Update `backend/src/index.js` with security middleware:
```javascript
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const cors = require('cors');
const config = require('./config/environments');

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Enable CORS with configuration
app.use(cors(config.cors));

// Body parser middleware with limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: ['sort', 'fields', 'page', 'limit'],
}));

// Compression middleware
app.use(compression());

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);
```

---

## 3. Service Layer Architecture

### 3.1 Base Service Class

Create `backend/src/services/baseService.js`:
```javascript
const { NotFoundError } = require('../utils/errors');
const logger = require('../utils/logger');

class BaseService {
  constructor(repository) {
    this.repository = repository;
  }

  async findAll(options = {}) {
    try {
      return await this.repository.findAll(options);
    } catch (error) {
      logger.error(`Error in ${this.constructor.name}.findAll:`, error);
      throw error;
    }
  }

  async findById(id, options = {}) {
    const result = await this.repository.findById(id, options);
    if (!result) {
      throw new NotFoundError(`Resource with id ${id} not found`);
    }
    return result;
  }

  async create(data, options = {}) {
    try {
      return await this.repository.create(data, options);
    } catch (error) {
      logger.error(`Error in ${this.constructor.name}.create:`, error);
      throw error;
    }
  }

  async update(id, data, options = {}) {
    const exists = await this.repository.exists(id);
    if (!exists) {
      throw new NotFoundError(`Resource with id ${id} not found`);
    }
    
    return await this.repository.update(id, data, options);
  }

  async delete(id, options = {}) {
    const exists = await this.repository.exists(id);
    if (!exists) {
      throw new NotFoundError(`Resource with id ${id} not found`);
    }
    
    return await this.repository.delete(id, options);
  }

  async count(criteria = {}) {
    return await this.repository.count(criteria);
  }
}

module.exports = BaseService;
```

### 3.2 Article Service Implementation

Create `backend/src/services/articleService.js`:
```javascript
const BaseService = require('./baseService');
const ArticleRepository = require('../repositories/articleRepository');
const TagRepository = require('../repositories/tagRepository');
const CacheService = require('./cacheService');
const { ValidationError, ForbiddenError } = require('../utils/errors');
const slug = require('slug');
const logger = require('../utils/logger');

class ArticleService extends BaseService {
  constructor() {
    super(new ArticleRepository());
    this.tagRepository = new TagRepository();
    this.cache = new CacheService('articles');
  }

  async createArticle(data, userId) {
    const transaction = await this.repository.startTransaction();
    
    try {
      // Validate required fields
      this.validateArticleData(data);
      
      // Generate unique slug
      const articleSlug = await this.generateUniqueSlug(data.title);
      
      // Prepare article data
      const articleData = {
        ...data,
        slug: articleSlug,
        user_id: userId,
        published_at: data.status === 'published' ? new Date() : null,
        excerpt: data.excerpt || this.generateExcerpt(data.content),
      };
      
      // Create article
      const article = await this.repository.create(articleData, { transaction });
      
      // Handle tags
      if (data.tags && data.tags.length > 0) {
        await this.attachTags(article.id, data.tags, transaction);
      }
      
      await transaction.commit();
      
      // Clear cache
      await this.cache.clear();
      
      // Return article with associations
      return await this.repository.findById(article.id, {
        include: ['author', 'tags'],
      });
    } catch (error) {
      await transaction.rollback();
      logger.error('Error creating article:', error);
      throw error;
    }
  }

  async updateArticle(id, data, userId, userRole) {
    const article = await this.repository.findById(id);
    
    // Check permissions
    if (article.user_id !== userId && userRole !== 'admin') {
      throw new ForbiddenError('You do not have permission to update this article');
    }
    
    const transaction = await this.repository.startTransaction();
    
    try {
      // Update slug if title changed
      if (data.title && data.title !== article.title) {
        data.slug = await this.generateUniqueSlug(data.title, id);
      }
      
      // Handle publishing
      if (data.status === 'published' && !article.published_at) {
        data.published_at = new Date();
      }
      
      // Update article
      await this.repository.update(id, data, { transaction });
      
      // Update tags if provided
      if (data.tags !== undefined) {
        await this.repository.clearTags(id, transaction);
        if (data.tags.length > 0) {
          await this.attachTags(id, data.tags, transaction);
        }
      }
      
      await transaction.commit();
      
      // Clear cache
      await this.cache.delete(id);
      await this.cache.clear();
      
      return await this.repository.findById(id, {
        include: ['author', 'tags', 'comments'],
      });
    } catch (error) {
      await transaction.rollback();
      logger.error('Error updating article:', error);
      throw error;
    }
  }

  async getArticles(filters = {}, pagination = {}) {
    const cacheKey = this.cache.generateKey('list', { filters, pagination });
    
    // Try cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;
    
    // Build query options
    const options = {
      where: this.buildWhereClause(filters),
      include: ['author', 'tags'],
      ...pagination,
    };
    
    const result = await this.repository.findAllWithCount(options);
    
    // Cache for 5 minutes
    await this.cache.set(cacheKey, result, 300);
    
    return result;
  }

  async getArticleBySlug(slug, incrementView = true) {
    const article = await this.repository.findBySlug(slug, {
      include: ['author', 'tags', 'comments'],
    });
    
    if (!article) {
      throw new NotFoundError('Article not found');
    }
    
    // Increment view count for published articles
    if (incrementView && article.status === 'published' && !article.blocked) {
      await this.repository.incrementViewCount(article.id);
    }
    
    return article;
  }

  async toggleLike(articleId, userId) {
    const article = await this.repository.findById(articleId);
    
    if (article.blocked) {
      throw new ForbiddenError('Cannot like a blocked article');
    }
    
    const existingLike = await this.repository.findLike(articleId, userId);
    
    if (existingLike) {
      await this.repository.removeLike(articleId, userId);
      return { liked: false };
    } else {
      await this.repository.addLike(articleId, userId);
      return { liked: true };
    }
  }

  async getPopularArticles(limit = 10) {
    const cacheKey = `popular:${limit}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;
    
    const articles = await this.repository.findPopular(limit);
    
    // Cache for 1 hour
    await this.cache.set(cacheKey, articles, 3600);
    
    return articles;
  }

  async getRelatedArticles(articleId, limit = 5) {
    const article = await this.repository.findById(articleId, {
      include: ['tags'],
    });
    
    if (!article || article.tags.length === 0) {
      return [];
    }
    
    const tagIds = article.tags.map(tag => tag.id);
    return await this.repository.findRelatedByTags(articleId, tagIds, limit);
  }

  // Private methods
  async generateUniqueSlug(title, excludeId = null) {
    let baseSlug = slug(title, { lower: true });
    let finalSlug = baseSlug;
    let counter = 1;
    
    while (await this.repository.slugExists(finalSlug, excludeId)) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    return finalSlug;
  }

  generateExcerpt(content, length = 200) {
    // Strip HTML tags
    const text = content.replace(/<[^>]*>/g, '');
    // Truncate and add ellipsis
    return text.length > length 
      ? text.substring(0, length).trim() + '...' 
      : text;
  }

  validateArticleData(data) {
    if (!data.title || data.title.trim().length < 3) {
      throw new ValidationError('Article title must be at least 3 characters');
    }
    
    if (!data.content || data.content.trim().length < 10) {
      throw new ValidationError('Article content must be at least 10 characters');
    }
    
    if (data.status && !['draft', 'published', 'archived'].includes(data.status)) {
      throw new ValidationError('Invalid article status');
    }
  }

  buildWhereClause(filters) {
    const where = {};
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.author) {
      where.user_id = filters.author;
    }
    
    if (filters.tag) {
      // This will be handled by repository with a join
      where.tag = filters.tag;
    }
    
    if (filters.search) {
      where.search = filters.search;
    }
    
    // Filter blocked articles for non-admins
    if (!filters.includeBlocked) {
      where.blocked = false;
    }
    
    return where;
  }

  async attachTags(articleId, tagNames, transaction) {
    const tags = await Promise.all(
      tagNames.map(async (name) => {
        const trimmedName = name.trim();
        let tag = await this.tagRepository.findByName(trimmedName);
        
        if (!tag) {
          tag = await this.tagRepository.create({
            name: trimmedName,
            slug: slug(trimmedName, { lower: true }),
          }, { transaction });
        }
        
        return tag;
      })
    );
    
    await this.repository.setTags(articleId, tags.map(t => t.id), transaction);
  }
}

module.exports = new ArticleService();
```

### 3.3 Authentication Service

Create `backend/src/services/authService.js`:
```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserRepository = require('../repositories/userRepository');
const EmailService = require('./emailService');
const CacheService = require('./cacheService');
const config = require('../config/environments');
const { 
  UnauthorizedError, 
  ValidationError, 
  ConflictError 
} = require('../utils/errors');
const logger = require('../utils/logger');

class AuthService {
  constructor() {
    this.userRepository = new UserRepository();
    this.emailService = new EmailService();
    this.cache = new CacheService('auth');
  }

  async register(userData) {
    // Validate user data
    await this.validateRegistration(userData);
    
    // Check if user exists
    const existingUser = await this.userRepository.findByEmailOrUsername(
      userData.email,
      userData.username
    );
    
    if (existingUser) {
      throw new ConflictError('User with this email or username already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(
      userData.password,
      config.security.bcryptRounds
    );
    
    // Create user
    const user = await this.userRepository.create({
      ...userData,
      password: hashedPassword,
      role: 'user',
      is_active: true,
    });
    
    // Generate tokens
    const tokens = this.generateTokens(user.id);
    
    // Send welcome email
    await this.emailService.sendWelcomeEmail(user.email, user.first_name);
    
    // Remove password from response
    delete user.password;
    
    return {
      user,
      ...tokens,
    };
  }

  async login(email, password) {
    // Find user
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }
    
    // Check if user is active
    if (!user.is_active) {
      throw new UnauthorizedError('Account is deactivated');
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      // Log failed attempt
      await this.logFailedLogin(user.id);
      throw new UnauthorizedError('Invalid credentials');
    }
    
    // Update last login
    await this.userRepository.updateLastLogin(user.id);
    
    // Generate tokens
    const tokens = this.generateTokens(user.id);
    
    // Cache user data
    await this.cache.set(`user:${user.id}`, user, 3600);
    
    // Remove password from response
    delete user.password;
    
    return {
      user,
      ...tokens,
    };
  }

  async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
      
      // Check if token is blacklisted
      const isBlacklisted = await this.cache.get(`blacklist:${refreshToken}`);
      if (isBlacklisted) {
        throw new UnauthorizedError('Invalid refresh token');
      }
      
      // Get user
      const user = await this.userRepository.findById(decoded.id);
      
      if (!user || !user.is_active) {
        throw new UnauthorizedError('User not found or inactive');
      }
      
      // Generate new tokens
      const tokens = this.generateTokens(user.id);
      
      // Blacklist old refresh token
      await this.blacklistToken(refreshToken, decoded.exp);
      
      return tokens;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Refresh token expired');
      }
      throw error;
    }
  }

  async logout(token, refreshToken) {
    try {
      // Blacklist both tokens
      const decoded = jwt.decode(token);
      const refreshDecoded = jwt.decode(refreshToken);
      
      if (decoded) {
        await this.blacklistToken(token, decoded.exp);
      }
      
      if (refreshDecoded) {
        await this.blacklistToken(refreshToken, refreshDecoded.exp);
      }
      
      return { message: 'Logged out successfully' };
    } catch (error) {
      logger.error('Error during logout:', error);
      // Don't throw error on logout
      return { message: 'Logged out' };
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    // Get user
    const user = await this.userRepository.findById(userId);
    
    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }
    
    // Validate new password
    this.validatePassword(newPassword);
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(
      newPassword,
      config.security.bcryptRounds
    );
    
    // Update password
    await this.userRepository.updatePassword(userId, hashedPassword);
    
    // Invalidate all user sessions
    await this.invalidateUserSessions(userId);
    
    return { message: 'Password changed successfully' };
  }

  async requestPasswordReset(email) {
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      // Don't reveal if user exists
      return { message: 'If the email exists, a reset link has been sent' };
    }
    
    // Generate reset token
    const resetToken = this.generateResetToken();
    const hashedToken = await bcrypt.hash(resetToken, 10);
    
    // Save hashed token with expiry
    await this.cache.set(
      `reset:${user.id}`,
      hashedToken,
      3600 // 1 hour
    );
    
    // Send reset email
    await this.emailService.sendPasswordResetEmail(
      user.email,
      resetToken,
      user.first_name
    );
    
    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(token, newPassword) {
    // Find user by token
    const users = await this.userRepository.findAll();
    let validUser = null;
    
    for (const user of users) {
      const cached = await this.cache.get(`reset:${user.id}`);
      if (cached && await bcrypt.compare(token, cached)) {
        validUser = user;
        break;
      }
    }
    
    if (!validUser) {
      throw new UnauthorizedError('Invalid or expired reset token');
    }
    
    // Validate new password
    this.validatePassword(newPassword);
    
    // Hash and update password
    const hashedPassword = await bcrypt.hash(
      newPassword,
      config.security.bcryptRounds
    );
    
    await this.userRepository.updatePassword(validUser.id, hashedPassword);
    
    // Delete reset token
    await this.cache.delete(`reset:${validUser.id}`);
    
    // Invalidate all sessions
    await this.invalidateUserSessions(validUser.id);
    
    return { message: 'Password reset successfully' };
  }

  // Private methods
  generateTokens(userId) {
    const accessToken = jwt.sign(
      { id: userId },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    
    const refreshToken = jwt.sign(
      { id: userId },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );
    
    return { accessToken, refreshToken };
  }

  generateResetToken() {
    return require('crypto').randomBytes(32).toString('hex');
  }

  async blacklistToken(token, expiry) {
    const ttl = expiry - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
      await this.cache.set(`blacklist:${token}`, true, ttl);
    }
  }

  async invalidateUserSessions(userId) {
    // In a production app, you'd maintain a session store
    // For now, we'll just clear the user cache
    await this.cache.delete(`user:${userId}`);
  }

  async logFailedLogin(userId) {
    const key = `failed:${userId}`;
    const attempts = (await this.cache.get(key)) || 0;
    
    await this.cache.set(key, attempts + 1, 3600); // Reset after 1 hour
    
    // Lock account after 5 failed attempts
    if (attempts >= 4) {
      await this.userRepository.update(userId, { is_active: false });
      logger.warn(`Account locked due to failed login attempts: ${userId}`);
    }
  }

  async validateRegistration(data) {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new ValidationError('Invalid email format');
    }
    
    // Username validation
    if (!data.username || data.username.length < 3) {
      throw new ValidationError('Username must be at least 3 characters');
    }
    
    // Password validation
    this.validatePassword(data.password);
    
    // Name validation
    if (!data.first_name || data.first_name.trim().length < 2) {
      throw new ValidationError('First name must be at least 2 characters');
    }
  }

  validatePassword(password) {
    if (!password || password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }
    
    // Check for complexity
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);
    
    if (!(hasUpperCase && hasLowerCase && hasNumbers)) {
      throw new ValidationError(
        'Password must contain uppercase, lowercase, and numbers'
      );
    }
  }
}

module.exports = new AuthService();
```

---

## 4. Repository Pattern

### 4.1 Base Repository

Create `backend/src/repositories/baseRepository.js`:
```javascript
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findAll(options = {}) {
    try {
      return await this.model.findAll(options);
    } catch (error) {
      logger.error(`Error in ${this.constructor.name}.findAll:`, error);
      throw error;
    }
  }

  async findAllWithCount(options = {}) {
    try {
      const { rows, count } = await this.model.findAndCountAll({
        ...options,
        distinct: true,
      });
      
      return {
        data: rows,
        total: count,
        page: options.offset ? Math.floor(options.offset / options.limit) + 1 : 1,
        totalPages: options.limit ? Math.ceil(count / options.limit) : 1,
      };
    } catch (error) {
      logger.error(`Error in ${this.constructor.name}.findAllWithCount:`, error);
      throw error;
    }
  }

  async findById(id, options = {}) {
    return await this.model.findByPk(id, options);
  }

  async findOne(criteria, options = {}) {
    return await this.model.findOne({
      where: criteria,
      ...options,
    });
  }

  async create(data, options = {}) {
    return await this.model.create(data, options);
  }

  async update(id, data, options = {}) {
    const [updatedCount, updatedRows] = await this.model.update(data, {
      where: { id },
      returning: true,
      ...options,
    });
    
    return updatedRows ? updatedRows[0] : null;
  }

  async delete(id, options = {}) {
    return await this.model.destroy({
      where: { id },
      ...options,
    });
  }

  async exists(id) {
    const count = await this.model.count({
      where: { id },
    });
    
    return count > 0;
  }

  async count(criteria = {}) {
    return await this.model.count({
      where: criteria,
    });
  }

  async bulkCreate(data, options = {}) {
    return await this.model.bulkCreate(data, options);
  }

  async bulkUpdate(data, criteria, options = {}) {
    return await this.model.update(data, {
      where: criteria,
      ...options,
    });
  }

  async bulkDelete(criteria, options = {}) {
    return await this.model.destroy({
      where: criteria,
      ...options,
    });
  }

  startTransaction() {
    return this.model.sequelize.transaction();
  }

  // Helper method to build complex where clauses
  buildWhereClause(filters) {
    const where = {};
    
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      
      if (value === null || value === undefined) {
        return;
      }
      
      // Handle different filter types
      if (key.endsWith('_like')) {
        const field = key.replace('_like', '');
        where[field] = { [Op.like]: `%${value}%` };
      } else if (key.endsWith('_gt')) {
        const field = key.replace('_gt', '');
        where[field] = { [Op.gt]: value };
      } else if (key.endsWith('_lt')) {
        const field = key.replace('_lt', '');
        where[field] = { [Op.lt]: value };
      } else if (key.endsWith('_between')) {
        const field = key.replace('_between', '');
        where[field] = { [Op.between]: value };
      } else if (Array.isArray(value)) {
        where[key] = { [Op.in]: value };
      } else {
        where[key] = value;
      }
    });
    
    return where;
  }
}

module.exports = BaseRepository;
```

### 4.2 Article Repository

Create `backend/src/repositories/articleRepository.js`:
```javascript
const { Article, User, Tag, Comment, Like, sequelize } = require('../models');
const BaseRepository = require('./baseRepository');
const { Op } = require('sequelize');

class ArticleRepository extends BaseRepository {
  constructor() {
    super(Article);
  }

  async findAllWithCount(options = {}) {
    const { where = {}, include = [], ...otherOptions } = options;
    
    // Handle special filters
    const processedWhere = this.processWhereClause(where);
    
    // Default includes
    const defaultInclude = [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'first_name', 'last_name', 'avatar'],
      },
      {
        model: Tag,
        as: 'tags',
        attributes: ['id', 'name', 'slug'],
        through: { attributes: [] },
      },
    ];
    
    return await super.findAllWithCount({
      where: processedWhere,
      include: [...defaultInclude, ...include],
      order: [['published_at', 'DESC']],
      ...otherOptions,
    });
  }

  async findBySlug(slug, options = {}) {
    return await this.findOne({ slug }, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'first_name', 'last_name', 'avatar', 'bio'],
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name', 'slug'],
        },
        {
          model: Comment,
          as: 'comments',
          where: { status: 'approved', parent_id: null },
          required: false,
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'username', 'avatar'],
            },
            {
              model: Comment,
              as: 'replies',
              where: { status: 'approved' },
              required: false,
              include: [{
                model: User,
                as: 'author',
                attributes: ['id', 'username', 'avatar'],
              }],
            },
          ],
        },
      ],
      ...options,
    });
  }

  async findPopular(limit = 10) {
    return await this.model.findAll({
      where: {
        status: 'published',
        blocked: false,
      },
      attributes: [
        'id',
        'title',
        'slug',
        'excerpt',
        'featured_image',
        'view_count',
        'published_at',
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM likes
            WHERE likes.article_id = Article.id
          )`),
          'like_count'
        ],
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM comments
            WHERE comments.article_id = Article.id
            AND comments.status = 'approved'
          )`),
          'comment_count'
        ],
      ],
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'first_name', 'last_name'],
      }],
      order: [
        ['view_count', 'DESC'],
        [sequelize.literal('like_count'), 'DESC'],
      ],
      limit,
    });
  }

  async findRelatedByTags(articleId, tagIds, limit = 5) {
    const query = `
      SELECT DISTINCT
        a.id,
        a.title,
        a.slug,
        a.excerpt,
        a.featured_image,
        a.published_at,
        COUNT(DISTINCT at2.tag_id) as common_tags
      FROM articles a
      INNER JOIN article_tags at2 ON a.id = at2.article_id
      WHERE 
        at2.tag_id IN (:tagIds)
        AND a.id != :articleId
        AND a.status = 'published'
        AND a.blocked = false
      GROUP BY a.id
      ORDER BY common_tags DESC, a.published_at DESC
      LIMIT :limit
    `;
    
    const articles = await sequelize.query(query, {
      replacements: { tagIds, articleId, limit },
      type: sequelize.QueryTypes.SELECT,
    });
    
    // Get full article data
    const articleIds = articles.map(a => a.id);
    
    return await this.model.findAll({
      where: { id: { [Op.in]: articleIds } },
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'first_name', 'last_name'],
      }],
    });
  }

  async incrementViewCount(id) {
    return await this.model.increment('view_count', {
      where: { id },
    });
  }

  async findLike(articleId, userId) {
    return await Like.findOne({
      where: { article_id: articleId, user_id: userId },
    });
  }

  async addLike(articleId, userId) {
    return await Like.create({
      article_id: articleId,
      user_id: userId,
    });
  }

  async removeLike(articleId, userId) {
    return await Like.destroy({
      where: { article_id: articleId, user_id: userId },
    });
  }

  async setTags(articleId, tagIds, transaction) {
    const article = await this.model.findByPk(articleId);
    return await article.setTags(tagIds, { transaction });
  }

  async clearTags(articleId, transaction) {
    const article = await this.model.findByPk(articleId);
    return await article.setTags([], { transaction });
  }

  async slugExists(slug, excludeId = null) {
    const where = { slug };
    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }
    
    const count = await this.model.count({ where });
    return count > 0;
  }

  async getArticleStats(userId = null) {
    const where = {};
    if (userId) {
      where.user_id = userId;
    }
    
    const [total, published, draft, views] = await Promise.all([
      this.model.count({ where }),
      this.model.count({ where: { ...where, status: 'published' } }),
      this.model.count({ where: { ...where, status: 'draft' } }),
      this.model.sum('view_count', { where }),
    ]);
    
    return {
      total,
      published,
      draft,
      totalViews: views || 0,
    };
  }

  // Private method to process where clause
  processWhereClause(where) {
    const processed = { ...where };
    
    // Handle search
    if (where.search) {
      processed[Op.or] = [
        { title: { [Op.like]: `%${where.search}%` } },
        { content: { [Op.like]: `%${where.search}%` } },
        { excerpt: { [Op.like]: `%${where.search}%` } },
      ];
      delete processed.search;
    }
    
    // Handle tag filter (requires join)
    if (where.tag) {
      // This will be handled in the include
      delete processed.tag;
    }
    
    return processed;
  }
}

module.exports = ArticleRepository;
```

---

## 5. Error Handling System

### 5.1 Custom Error Classes

Create `backend/src/utils/errors.js`:
```javascript
class AppError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.errors = errors;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors = null) {
    super(message, 400, errors);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
  }
}

class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429);
  }
}

class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 500);
  }
}

module.exports = {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  TooManyRequestsError,
  InternalServerError,
};
```

### 5.2 Async Handler

Create `backend/src/utils/asyncHandler.js`:
```javascript
/**
 * Async handler to wrap async route handlers
 * Automatically catches errors and passes them to error handling middleware
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;
```

### 5.3 Global Error Handler

Update `backend/src/middleware/errorHandler.js`:
```javascript
const { ValidationError: SequelizeValidationError } = require('sequelize');
const { AppError } = require('../utils/errors');
const logger = require('../utils/logger');
const config = require('../config/environments');

const sendErrorDev = (err, req, res) => {
  res.status(err.statusCode).json({
    success: false,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, req, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('ERROR 💥', err);
    
    res.status(500).json({
      success: false,
      message: 'Something went wrong!',
    });
  }
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const handleSequelizeValidationError = (err) => {
  const errors = err.errors.map(e => ({
    field: e.path,
    message: e.message,
  }));
  
  return new AppError('Validation failed', 400, errors);
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  // Log error
  logger.error({
    error: err,
    request: req.url,
    method: req.method,
    ip: req.ip,
  });
  
  if (config.env === 'development') {
    sendErrorDev(err, req, res);
  } else {
    let error = { ...err };
    error.message = err.message;
    
    // Handle specific errors
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (err instanceof SequelizeValidationError) {
      error = handleSequelizeValidationError(err);
    }
    
    sendErrorProd(error, req, res);
  }
};

module.exports = errorHandler;
```

---

## 6. Logging System

### 6.1 Winston Logger Configuration

Create `backend/src/utils/logger.js`:
```javascript
const winston = require('winston');
const path = require('path');
const config = require('../config/environments');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define custom log format for console
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
  })
);

// Define transports
const transports = [];

// Console transport
if (config.env !== 'test') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// File transports
transports.push(
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  })
);

transports.push(
  new winston.transports.File({
    filename: path.join('logs', 'combined.log'),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  })
);

// Create logger
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  transports,
  exitOnError: false,
});

// Create HTTP logger middleware
logger.httpLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new winston.transports.File({
      filename: path.join('logs', 'http.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Stream for Morgan
logger.stream = {
  write: (message) => {
    logger.httpLogger.info(message.trim());
  },
};

module.exports = logger;
```

### 6.2 Request Logger Middleware

Create `backend/src/middleware/requestLogger.js`:
```javascript
const morgan = require('morgan');
const logger = require('../utils/logger');
const config = require('../config/environments');

// Custom tokens
morgan.token('user-id', (req) => {
  return req.user ? req.user.id : 'anonymous';
});

morgan.token('body', (req) => {
  // Don't log sensitive fields
  const body = { ...req.body };
  delete body.password;
  delete body.currentPassword;
  delete body.newPassword;
  return JSON.stringify(body);
});

// Define format
const format = config.env === 'development'
  ? 'dev'
  : ':remote-addr - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms ":referrer" ":user-agent"';

// Skip logging for certain paths
const skip = (req) => {
  const skipPaths = ['/health', '/api/health'];
  return skipPaths.includes(req.path);
};

const requestLogger = morgan(format, {
  stream: logger.stream,
  skip,
});

module.exports = requestLogger;
```

---

## 7. API Documentation

### 7.1 Swagger Configuration

Create `backend/src/config/swagger.js`:
```javascript
const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./environments');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BeeKeeper's Blog API',
      version: '1.0.0',
      description: 'A comprehensive blogging platform API for beekeeping enthusiasts',
      contact: {
        name: 'API Support',
        email: 'api@beekeeperblog.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api`,
        description: 'Development server',
      },
      {
        url: 'https://api.beekeeperblog.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
              },
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              example: 1,
            },
            limit: {
              type: 'integer',
              example: 10,
            },
            totalPages: {
              type: 'integer',
              example: 5,
            },
            total: {
              type: 'integer',
              example: 50,
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/models/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
```

### 7.2 API Documentation Route

Update routes to include Swagger documentation:
```javascript
// backend/src/routes/docs.js
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const specs = require('../config/swagger');

const router = express.Router();

/**
 * @swagger
 * /api/articles:
 *   get:
 *     summary: Get all articles
 *     tags: [Articles]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *         description: Filter by article status
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter by tag slug
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, content, and excerpt
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Article'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// Swagger UI options
const options = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'BeeKeeper's Blog API Documentation',
};

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(specs, options));

module.exports = router;
```

---

## 8. Testing Framework

### 8.1 Jest Configuration

Create `backend/jest.config.js`:
```javascript
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**',
    '!src/config/**',
    '!src/index.js',
  ],
  testMatch: [
    '**/tests/**/*.test.js',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
  setupFilesAfterEnv: ['./src/tests/setup.js'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
```

### 8.2 Test Setup

Create `backend/src/tests/setup.js`:
```javascript
const { sequelize } = require('../models');

// Increase timeout for database operations
jest.setTimeout(30000);

// Setup before all tests
beforeAll(async () => {
  await sequelize.sync({ force: true });
});

// Cleanup after all tests
afterAll(async () => {
  await sequelize.close();
});

// Global test utilities
global.createAuthHeader = (token) => ({
  Authorization: `Bearer ${token}`,
});

global.expectError = (response, statusCode, message) => {
  expect(response.status).toBe(statusCode);
  expect(response.body.success).toBe(false);
  if (message) {
    expect(response.body.message).toContain(message);
  }
};
```

### 8.3 Test Factories

Create `backend/src/tests/factories/userFactory.js`:
```javascript
const { User } = require('../../models');
const bcrypt = require('bcryptjs');

class UserFactory {
  static async create(overrides = {}) {
    const defaultData = {
      username: `user_${Date.now()}`,
      email: `user_${Date.now()}@example.com`,
      password: await bcrypt.hash('password123', 10),
      first_name: 'Test',
      last_name: 'User',
      role: 'user',
      is_active: true,
    };
    
    return User.create({ ...defaultData, ...overrides });
  }
  
  static async createAdmin(overrides = {}) {
    return this.create({ ...overrides, role: 'admin' });
  }
  
  static async createAuthor(overrides = {}) {
    return this.create({ ...overrides, role: 'author' });
  }
}

module.exports = UserFactory;
```

### 8.4 Integration Test Example

Create `backend/src/tests/integration/auth.test.js`:
```javascript
const request = require('supertest');
const app = require('../../index');
const UserFactory = require('../factories/userFactory');
const { User } = require('../../models');

describe('Auth Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      
      // Verify user was created in database
      const user = await User.findOne({ where: { email: userData.email } });
      expect(user).toBeDefined();
      expect(user.role).toBe('user');
    });
    
    it('should not register user with duplicate email', async () => {
      const existingUser = await UserFactory.create();
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: existingUser.email,
          password: 'Password123!',
          firstName: 'New',
          lastName: 'User',
        });
      
      expectError(response, 409, 'already exists');
    });
    
    it('should validate password strength', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'weak',
          firstName: 'Test',
          lastName: 'User',
        });
      
      expectError(response, 400, 'Password must');
    });
  });
  
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const password = 'Password123!';
      const user = await UserFactory.create({
        password: await require('bcryptjs').hash(password, 10),
      });
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password,
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.id).toBe(user.id);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
    });
    
    it('should not login with invalid password', async () => {
      const user = await UserFactory.create();
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'wrongpassword',
        });
      
      expectError(response, 401, 'Invalid credentials');
    });
    
    it('should not login inactive user', async () => {
      const password = 'Password123!';
      const user = await UserFactory.create({
        is_active: false,
        password: await require('bcryptjs').hash(password, 10),
      });
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password,
        });
      
      expectError(response, 401, 'deactivated');
    });
  });
});
```

### 8.5 Unit Test Example

Create `backend/src/tests/unit/services/articleService.test.js`:
```javascript
const ArticleService = require('../../../services/articleService');
const ArticleRepository = require('../../../repositories/articleRepository');
const { ValidationError, ForbiddenError } = require('../../../utils/errors');

// Mock the repository
jest.mock('../../../repositories/articleRepository');

describe('ArticleService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('createArticle', () => {
    it('should create article with valid data', async () => {
      const mockArticle = {
        id: 1,
        title: 'Test Article',
        slug: 'test-article',
      };
      
      const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn(),
      };
      
      ArticleRepository.prototype.startTransaction = jest.fn()
        .mockResolvedValue(mockTransaction);
      ArticleRepository.prototype.create = jest.fn()
        .mockResolvedValue(mockArticle);
      ArticleRepository.prototype.findById = jest.fn()
        .mockResolvedValue(mockArticle);
      ArticleRepository.prototype.slugExists = jest.fn()
        .mockResolvedValue(false);
      
      const articleData = {
        title: 'Test Article',
        content: 'Test content here',
        tags: ['test'],
      };
      
      const result = await ArticleService.createArticle(articleData, 1);
      
      expect(result).toEqual(mockArticle);
      expect(ArticleRepository.prototype.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Article',
          slug: 'test-article',
          user_id: 1,
        }),
        { transaction: mockTransaction }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
    });
    
    it('should rollback transaction on error', async () => {
      const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn(),
      };
      
      ArticleRepository.prototype.startTransaction = jest.fn()
        .mockResolvedValue(mockTransaction);
      ArticleRepository.prototype.create = jest.fn()
        .mockRejectedValue(new Error('Database error'));
      ArticleRepository.prototype.slugExists = jest.fn()
        .mockResolvedValue(false);
      
      const articleData = {
        title: 'Test Article',
        content: 'Test content',
      };
      
      await expect(ArticleService.createArticle(articleData, 1))
        .rejects.toThrow('Database error');
      
      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockTransaction.commit).not.toHaveBeenCalled();
    });
    
    it('should validate article data', async () => {
      const articleData = {
        title: 'Te', // Too short
        content: 'Test',
      };
      
      await expect(ArticleService.createArticle(articleData, 1))
        .rejects.toThrow(ValidationError);
    });
  });
  
  describe('updateArticle', () => {
    it('should allow author to update their article', async () => {
      const mockArticle = {
        id: 1,
        user_id: 1,
        title: 'Old Title',
      };
      
      const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn(),
      };
      
      ArticleRepository.prototype.findById = jest.fn()
        .mockResolvedValue(mockArticle);
      ArticleRepository.prototype.startTransaction = jest.fn()
        .mockResolvedValue(mockTransaction);
      ArticleRepository.prototype.update = jest.fn()
        .mockResolvedValue(true);
      ArticleRepository.prototype.slugExists = jest.fn()
        .mockResolvedValue(false);
      
      const updateData = {
        title: 'New Title',
        content: 'Updated content',
      };
      
      await ArticleService.updateArticle(1, updateData, 1, 'author');
      
      expect(ArticleRepository.prototype.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          title: 'New Title',
          slug: 'new-title',
        }),
        { transaction: mockTransaction }
      );
    });
    
    it('should not allow non-owner to update article', async () => {
      const mockArticle = {
        id: 1,
        user_id: 1,
      };
      
      ArticleRepository.prototype.findById = jest.fn()
        .mockResolvedValue(mockArticle);
      
      await expect(
        ArticleService.updateArticle(1, {}, 2, 'author')
      ).rejects.toThrow(ForbiddenError);
    });
    
    it('should allow admin to update any article', async () => {
      const mockArticle = {
        id: 1,
        user_id: 1,
      };
      
      const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn(),
      };
      
      ArticleRepository.prototype.findById = jest.fn()
        .mockResolvedValue(mockArticle);
      ArticleRepository.prototype.startTransaction = jest.fn()
        .mockResolvedValue(mockTransaction);
      ArticleRepository.prototype.update = jest.fn()
        .mockResolvedValue(true);
      
      await ArticleService.updateArticle(
        1, 
        { content: 'Updated' }, 
        2, 
        'admin'
      );
      
      expect(ArticleRepository.prototype.update).toHaveBeenCalled();
    });
  });
});
```

---

## 9. Caching Layer

### 9.1 Redis Configuration

Create `backend/src/config/redis.js`:
```javascript
const Redis = require('ioredis');
const config = require('./environments');
const logger = require('../utils/logger');

let redis = null;

if (config.redis.url) {
  redis = new Redis(config.redis.url, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });
  
  redis.on('connect', () => {
    logger.info('Redis connected');
  });
  
  redis.on('error', (err) => {
    logger.error('Redis error:', err);
  });
  
  redis.on('close', () => {
    logger.warn('Redis connection closed');
  });
}

module.exports = { redis };
```

### 9.2 Cache Service

Create `backend/src/services/cacheService.js`:
```javascript
const { redis } = require('../config/redis');
const logger = require('../utils/logger');

class CacheService {
  constructor(prefix = '') {
    this.prefix = prefix;
    this.defaultTTL = 3600; // 1 hour
  }
  
  generateKey(...parts) {
    const key = parts
      .filter(Boolean)
      .map(part => {
        if (typeof part === 'object') {
          return JSON.stringify(part, Object.keys(part).sort());
        }
        return String(part);
      })
      .join(':');
    
    return this.prefix ? `${this.prefix}:${key}` : key;
  }
  
  async get(key) {
    if (!redis) return null;
    
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }
  
  async set(key, value, ttl = this.defaultTTL) {
    if (!redis) return false;
    
    try {
      const serialized = JSON.stringify(value);
      
      if (ttl) {
        await redis.setex(key, ttl, serialized);
      } else {
        await redis.set(key, serialized);
      }
      
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }
  
  async delete(key) {
    if (!redis) return false;
    
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }
  
  async clear(pattern = '*') {
    if (!redis) return false;
    
    try {
      const keys = await redis.keys(
        this.prefix ? `${this.prefix}:${pattern}` : pattern
      );
      
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      
      return true;
    } catch (error) {
      logger.error('Cache clear error:', error);
      return false;
    }
  }
  
  async remember(key, ttl, callback) {
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }
    
    const fresh = await callback();
    await this.set(key, fresh, ttl);
    
    return fresh;
  }
  
  async invalidateTags(tags) {
    if (!redis || !Array.isArray(tags)) return false;
    
    try {
      for (const tag of tags) {
        const keys = await redis.keys(`*:tag:${tag}:*`);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      }
      
      return true;
    } catch (error) {
      logger.error('Cache invalidate tags error:', error);
      return false;
    }
  }
}

module.exports = CacheService;
```

### 9.3 Cache Middleware

Create `backend/src/middleware/cache.js`:
```javascript
const CacheService = require('../services/cacheService');
const logger = require('../utils/logger');

const cache = (options = {}) => {
  const {
    prefix = 'api',
    ttl = 300, // 5 minutes
    keyGenerator = null,
    condition = null,
  } = options;
  
  const cacheService = new CacheService(prefix);
  
  return async (req, res, next) => {
    // Check if caching should be applied
    if (condition && !condition(req)) {
      return next();
    }
    
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Generate cache key
    const key = keyGenerator
      ? keyGenerator(req)
      : cacheService.generateKey(req.path, req.query);
    
    try {
      // Try to get from cache
      const cached = await cacheService.get(key);
      
      if (cached) {
        logger.debug(`Cache hit: ${key}`);
        
        // Add cache headers
        res.set({
          'X-Cache': 'HIT',
          'X-Cache-Key': key,
        });
        
        return res.json(cached);
      }
      
      // Cache miss - store original json method
      const originalJson = res.json;
      
      // Override json method to cache successful responses
      res.json = function(data) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheService.set(key, data, ttl).catch(err => {
            logger.error('Failed to cache response:', err);
          });
        }
        
        // Add cache headers
        res.set({
          'X-Cache': 'MISS',
          'X-Cache-Key': key,
        });
        
        // Call original json method
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

// Cache invalidation middleware
const invalidateCache = (patterns = []) => {
  const cacheService = new CacheService();
  
  return async (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      // Invalidate cache after successful modifications
      if (
        res.statusCode >= 200 && 
        res.statusCode < 300 && 
        ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)
      ) {
        Promise.all(
          patterns.map(pattern => {
            const key = typeof pattern === 'function' 
              ? pattern(req, data) 
              : pattern;
            return cacheService.clear(key);
          })
        ).catch(err => {
          logger.error('Cache invalidation error:', err);
        });
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
};

module.exports = { cache, invalidateCache };
```

---

## 10. Database Optimizations

### 10.1 Migration for Indexes

Create `backend/migrations/[timestamp]-add-performance-indexes.js`:
```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Articles indexes
    await queryInterface.addIndex('articles', ['slug'], {
      unique: true,
      name: 'articles_slug_unique'
    });
    
    await queryInterface.addIndex('articles', ['user_id', 'status'], {
      name: 'articles_user_status_index'
    });
    
    await queryInterface.addIndex('articles', ['status', 'blocked', 'published_at'], {
      name: 'articles_status_blocked_published_index'
    });
    
    await queryInterface.addIndex('articles', ['created_at'], {
      name: 'articles_created_at_index'
    });
    
    // Comments indexes
    await queryInterface.addIndex('comments', ['article_id', 'status'], {
      name: 'comments_article_status_index'
    });
    
    await queryInterface.addIndex('comments', ['user_id'], {
      name: 'comments_user_id_index'
    });
    
    await queryInterface.addIndex('comments', ['parent_id'], {
      name: 'comments_parent_id_index'
    });
    
    // Users indexes
    await queryInterface.addIndex('users', ['email'], {
      unique: true,
      name: 'users_email_unique'
    });
    
    await queryInterface.addIndex('users', ['username'], {
      unique: true,
      name: 'users_username_unique'
    });
    
    await queryInterface.addIndex('users', ['role', 'is_active'], {
      name: 'users_role_active_index'
    });
    
    // Tags indexes
    await queryInterface.addIndex('tags', ['slug'], {
      unique: true,
      name: 'tags_slug_unique'
    });
    
    await queryInterface.addIndex('tags', ['name'], {
      unique: true,
      name: 'tags_name_unique'
    });
    
    // Article tags indexes
    await queryInterface.addIndex('article_tags', ['article_id', 'tag_id'], {
      unique: true,
      name: 'article_tags_unique'
    });
    
    await queryInterface.addIndex('article_tags', ['tag_id'], {
      name: 'article_tags_tag_id_index'
    });
    
    // Likes indexes
    await queryInterface.addIndex('likes', ['article_id', 'user_id'], {
      unique: true,
      name: 'likes_article_user_unique'
    });
    
    await queryInterface.addIndex('likes', ['user_id'], {
      name: 'likes_user_id_index'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove all indexes
    await queryInterface.removeIndex('articles', 'articles_slug_unique');
    await queryInterface.removeIndex('articles', 'articles_user_status_index');
    await queryInterface.removeIndex('articles', 'articles_status_blocked_published_index');
    await queryInterface.removeIndex('articles', 'articles_created_at_index');
    
    await queryInterface.removeIndex('comments', 'comments_article_status_index');
    await queryInterface.removeIndex('comments', 'comments_user_id_index');
    await queryInterface.removeIndex('comments', 'comments_parent_id_index');
    
    await queryInterface.removeIndex('users', 'users_email_unique');
    await queryInterface.removeIndex('users', 'users_username_unique');
    await queryInterface.removeIndex('users', 'users_role_active_index');
    
    await queryInterface.removeIndex('tags', 'tags_slug_unique');
    await queryInterface.removeIndex('tags', 'tags_name_unique');
    
    await queryInterface.removeIndex('article_tags', 'article_tags_unique');
    await queryInterface.removeIndex('article_tags', 'article_tags_tag_id_index');
    
    await queryInterface.removeIndex('likes', 'likes_article_user_unique');
    await queryInterface.removeIndex('likes', 'likes_user_id_index');
  }
};
```

### 10.2 Database Query Optimization Service

Create `backend/src/services/databaseOptimizationService.js`:
```javascript
const { sequelize } = require('../models');
const logger = require('../utils/logger');

class DatabaseOptimizationService {
  async analyzeQueries() {
    try {
      // Get slow queries (MySQL specific)
      const slowQueries = await sequelize.query(
        `SELECT 
          query_time,
          lock_time,
          rows_sent,
          rows_examined,
          sql_text
        FROM mysql.slow_log
        ORDER BY query_time DESC
        LIMIT 10`,
        { type: sequelize.QueryTypes.SELECT }
      );
      
      return slowQueries;
    } catch (error) {
      logger.error('Error analyzing queries:', error);
      return [];
    }
  }
  
  async getTableStats() {
    try {
      const stats = await sequelize.query(
        `SELECT 
          table_name,
          table_rows,
          data_length,
          index_length,
          ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
        FROM information_schema.TABLES
        WHERE table_schema = DATABASE()
        ORDER BY (data_length + index_length) DESC`,
        { type: sequelize.QueryTypes.SELECT }
      );
      
      return stats;
    } catch (error) {
      logger.error('Error getting table stats:', error);
      return [];
    }
  }
  
  async optimizeTables() {
    try {
      const tables = ['articles', 'comments', 'users', 'tags'];
      
      for (const table of tables) {
        await sequelize.query(`OPTIMIZE TABLE ${table}`);
        logger.info(`Optimized table: ${table}`);
      }
      
      return true;
    } catch (error) {
      logger.error('Error optimizing tables:', error);
      return false;
    }
  }
  
  async analyzeIndexUsage() {
    try {
      const unusedIndexes = await sequelize.query(
        `SELECT 
          s.table_name,
          s.index_name,
          s.column_name
        FROM information_schema.statistics s
        LEFT JOIN information_schema.index_statistics i 
          ON s.table_schema = i.table_schema 
          AND s.table_name = i.table_name 
          AND s.index_name = i.index_name
        WHERE s.table_schema = DATABASE()
          AND s.index_name != 'PRIMARY'
          AND i.rows_read IS NULL`,
        { type: sequelize.QueryTypes.SELECT }
      );
      
      return unusedIndexes;
    } catch (error) {
      logger.error('Error analyzing index usage:', error);
      return [];
    }
  }
}

module.exports = new DatabaseOptimizationService();
```

### 10.3 Database Health Check

Create `backend/src/utils/databaseHealthCheck.js`:
```javascript
const { sequelize } = require('../models');
const logger = require('./logger');

class DatabaseHealthCheck {
  async checkConnection() {
    try {
      await sequelize.authenticate();
      return { status: 'connected', latency: 0 };
    } catch (error) {
      logger.error('Database connection failed:', error);
      return { status: 'disconnected', error: error.message };
    }
  }
  
  async checkPoolStatus() {
    const pool = sequelize.connectionManager.pool;
    
    return {
      size: pool.size,
      available: pool.available,
      using: pool.using,
      waiting: pool.waiting,
    };
  }
  
  async runHealthCheck() {
    const [connection, pool] = await Promise.all([
      this.checkConnection(),
      this.checkPoolStatus(),
    ]);
    
    return {
      connection,
      pool,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new DatabaseHealthCheck();
```

---

## Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Set up new directory structure
- [ ] Install all dependencies
- [ ] Configure environment variables
- [ ] Set up logging system
- [ ] Implement error handling
- [ ] Set up ESLint and Prettier

### Phase 2: Security (Week 2)
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Set up authentication improvements
- [ ] Configure security headers
- [ ] Implement CSRF protection
- [ ] Set up API key management

### Phase 3: Architecture (Week 3-4)
- [ ] Create base repository and service classes
- [ ] Implement repository pattern for all models
- [ ] Create service layer for business logic
- [ ] Refactor controllers to use services
- [ ] Implement caching layer
- [ ] Add database indexes

### Phase 4: Quality (Week 5)
- [ ] Set up testing framework
- [ ] Write unit tests for services
- [ ] Write integration tests for APIs
- [ ] Add API documentation
- [ ] Set up CI/CD pipeline
- [ ] Performance testing

### Phase 5: Optimization (Week 6)
- [ ] Implement query optimization
- [ ] Add monitoring and metrics
- [ ] Set up health checks
- [ ] Load testing
- [ ] Security audit
- [ ] Production deployment preparation

---

## Best Practices

### Code Style
```javascript
// Use async/await consistently
const getUser = async (id) => {
  try {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  } catch (error) {
    logger.error('Error getting user:', error);
    throw error;
  }
};

// Use object destructuring
const { name, email, role } = req.body;

// Use early returns
if (!isValid) {
  return res.status(400).json({ error: 'Invalid input' });
}

// Use meaningful variable names
const isEmailTaken = await userRepository.emailExists(email);
```

### Git Workflow
```bash
# Feature branch workflow
git checkout -b feature/implement-caching
git add .
git commit -m "feat: add Redis caching layer"
git push origin feature/implement-caching

# Commit message format
# feat: add new feature
# fix: fix bug
# docs: update documentation
# style: format code
# refactor: refactor code
# test: add tests
# chore: update dependencies
```

### Environment Management
```bash
# Development
npm run dev

# Testing
npm test
npm run test:coverage

# Production build
npm run build
npm start

# Database
npm run migrate
npm run seed
```

---

## Monitoring and Maintenance

### Application Monitoring
- Use PM2 for process management
- Set up New Relic or DataDog for APM
- Configure CloudWatch for AWS deployments
- Set up Sentry for error tracking

### Database Monitoring
- Monitor slow queries
- Track connection pool usage
- Set up automated backups
- Monitor table sizes and growth

### Security Monitoring
- Set up intrusion detection
- Monitor failed login attempts
- Track API usage patterns
- Regular security audits

---

## Conclusion

This implementation guide provides a comprehensive roadmap for transforming your backend into a production-ready, scalable application. Follow the phases systematically, test thoroughly, and monitor continuously for best results.