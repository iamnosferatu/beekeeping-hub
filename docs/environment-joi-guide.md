# Complete Guide: Environment Configuration with Joi Validation

## Table of Contents
1. [Understanding the Purpose](#1-understanding-the-purpose)
2. [Setting Up Environment Files](#2-setting-up-environment-files)
3. [Creating the Environments Configuration](#3-creating-the-environments-configuration)
4. [Using the Configuration](#4-using-the-configuration)
5. [Best Practices](#5-best-practices)
6. [Common Patterns](#6-common-patterns)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Understanding the Purpose

### Why Use Joi for Environment Variables?

1. **Type Safety**: Ensures environment variables are the correct type
2. **Validation**: Validates values meet specific criteria
3. **Defaults**: Provides sensible defaults for optional variables
4. **Documentation**: Self-documents required environment variables
5. **Early Failure**: Fails fast on startup if configuration is invalid

### Benefits Over Traditional Approach

```javascript
// ❌ Traditional approach - error-prone
const port = process.env.PORT || 3000; // What if PORT="abc"?
const isProduction = process.env.NODE_ENV === 'production'; // Typos?

// ✅ With Joi validation
const config = validateEnvironment(process.env);
const port = config.port; // Guaranteed to be a number
const isProduction = config.env === 'production'; // Validated enum
```

---

## 2. Setting Up Environment Files

### Step 1: Install Dependencies

```bash
npm install joi dotenv
npm install --save-dev cross-env
```

### Step 2: Create Environment Files

Create multiple environment files for different environments:

#### `.env.example` (commit this to git)
```bash
# Application
NODE_ENV=development
PORT=8080

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=beekeeper_db
DB_POOL_MAX=20
DB_POOL_MIN=5

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRE=30d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-at-least-32-characters
JWT_REFRESH_EXPIRE=90d

# Redis Cache
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Security
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# Logging
LOG_LEVEL=debug
LOG_DIR=logs

# File Upload
UPLOAD_MAX_FILE_SIZE=5242880
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif

# External APIs
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SENDGRID_API_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=

# Feature Flags
ENABLE_SWAGGER=true
ENABLE_RATE_LIMITING=true
ENABLE_EMAIL_VERIFICATION=false
```

#### `.env.development` (local development)
```bash
NODE_ENV=development
PORT=8080
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
# ... other dev-specific values
```

#### `.env.test` (testing)
```bash
NODE_ENV=test
PORT=8081
DB_HOST=localhost
DB_NAME=beekeeper_test
LOG_LEVEL=error
# ... other test-specific values
```

#### `.env.production` (don't commit - use secure storage)
```bash
NODE_ENV=production
PORT=8080
DB_HOST=prod-db.aws.com
# ... production values
```

### Step 3: Update `.gitignore`

```gitignore
# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production
.env.production.local

# Keep example
!.env.example
```

---

## 3. Creating the Environments Configuration

### Complete Implementation

Create `backend/src/config/environments.js`:

```javascript
const joi = require('joi');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config({
  path: path.join(__dirname, '../../', `.env.${process.env.NODE_ENV || 'development'}`)
});

// Define validation schema for ALL environment variables
const envVarsSchema = joi.object({
  // Application
  NODE_ENV: joi.string()
    .valid('development', 'test', 'production', 'staging')
    .default('development')
    .description('Application environment'),
  
  PORT: joi.number()
    .port()
    .default(8080)
    .description('Server port'),
  
  // Database Configuration
  DB_HOST: joi.string()
    .required()
    .description('Database host'),
  
  DB_PORT: joi.number()
    .port()
    .default(3306)
    .description('Database port'),
  
  DB_USER: joi.string()
    .required()
    .description('Database username'),
  
  DB_PASSWORD: joi.string()
    .required()
    .allow('') // Allow empty in development
    .description('Database password'),
  
  DB_NAME: joi.string()
    .required()
    .description('Database name'),
  
  DB_POOL_MAX: joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .description('Maximum database pool connections'),
  
  DB_POOL_MIN: joi.number()
    .integer()
    .min(0)
    .max(100)
    .default(5)
    .description('Minimum database pool connections'),
  
  // JWT Configuration
  JWT_SECRET: joi.string()
    .min(32)
    .required()
    .description('JWT secret key'),
  
  JWT_EXPIRE: joi.string()
    .pattern(/^\d+[hdwmy]$/) // e.g., 30d, 2h, 1w
    .default('30d')
    .description('JWT expiration time'),
  
  JWT_REFRESH_SECRET: joi.string()
    .min(32)
    .required()
    .description('JWT refresh token secret'),
  
  JWT_REFRESH_EXPIRE: joi.string()
    .pattern(/^\d+[hdwmy]$/)
    .default('90d')
    .description('JWT refresh token expiration'),
  
  // Redis Configuration
  REDIS_URL: joi.string()
    .uri({ scheme: ['redis', 'rediss'] })
    .default('redis://localhost:6379')
    .description('Redis connection URL'),
  
  REDIS_PASSWORD: joi.string()
    .allow('')
    .default('')
    .description('Redis password'),
  
  // Email Configuration
  SMTP_HOST: joi.string()
    .hostname()
    .when('ENABLE_EMAIL_VERIFICATION', {
      is: true,
      then: joi.required(),
      otherwise: joi.optional()
    })
    .description('SMTP server host'),
  
  SMTP_PORT: joi.number()
    .port()
    .default(587)
    .description('SMTP server port'),
  
  SMTP_SECURE: joi.boolean()
    .default(false)
    .description('Use TLS for SMTP'),
  
  SMTP_USER: joi.string()
    .email()
    .when('ENABLE_EMAIL_VERIFICATION', {
      is: true,
      then: joi.required(),
      otherwise: joi.optional()
    })
    .description('SMTP username'),
  
  SMTP_PASS: joi.string()
    .when('ENABLE_EMAIL_VERIFICATION', {
      is: true,
      then: joi.required(),
      otherwise: joi.optional()
    })
    .description('SMTP password'),
  
  // Security Configuration
  BCRYPT_ROUNDS: joi.number()
    .integer()
    .min(1)
    .max(20)
    .default(10)
    .description('Bcrypt salt rounds'),
  
  RATE_LIMIT_WINDOW_MS: joi.number()
    .integer()
    .min(1000)
    .default(15 * 60 * 1000) // 15 minutes
    .description('Rate limit window in milliseconds'),
  
  RATE_LIMIT_MAX_REQUESTS: joi.number()
    .integer()
    .min(1)
    .default(100)
    .description('Maximum requests per rate limit window'),
  
  // CORS Configuration
  CORS_ORIGIN: joi.alternatives()
    .try(
      joi.string().uri(),
      joi.string().valid('*'),
      joi.array().items(joi.string().uri())
    )
    .default('http://localhost:3000')
    .description('CORS allowed origins'),
  
  CORS_CREDENTIALS: joi.boolean()
    .default(true)
    .description('Allow credentials in CORS'),
  
  // Logging Configuration
  LOG_LEVEL: joi.string()
    .valid('error', 'warn', 'info', 'debug', 'silly')
    .default('info')
    .description('Logging level'),
  
  LOG_DIR: joi.string()
    .default('logs')
    .description('Log files directory'),
  
  // File Upload Configuration
  UPLOAD_MAX_FILE_SIZE: joi.number()
    .integer()
    .min(1024) // 1KB minimum
    .max(104857600) // 100MB maximum
    .default(5242880) // 5MB default
    .description('Maximum file upload size in bytes'),
  
  UPLOAD_ALLOWED_TYPES: joi.string()
    .pattern(/^[\w\/,]+$/)
    .default('image/jpeg,image/png,image/gif')
    .description('Comma-separated list of allowed MIME types'),
  
  // External APIs
  STRIPE_SECRET_KEY: joi.string()
    .when('NODE_ENV', {
      is: 'production',
      then: joi.required(),
      otherwise: joi.optional()
    }),
  
  STRIPE_WEBHOOK_SECRET: joi.string().optional(),
  
  SENDGRID_API_KEY: joi.string().optional(),
  
  AWS_ACCESS_KEY_ID: joi.string().optional(),
  AWS_SECRET_ACCESS_KEY: joi.string().optional(),
  AWS_REGION: joi.string().default('us-east-1'),
  AWS_S3_BUCKET: joi.string().optional(),
  
  // Feature Flags
  ENABLE_SWAGGER: joi.boolean()
    .default(true)
    .description('Enable Swagger documentation'),
  
  ENABLE_RATE_LIMITING: joi.boolean()
    .default(true)
    .description('Enable rate limiting'),
  
  ENABLE_EMAIL_VERIFICATION: joi.boolean()
    .default(false)
    .description('Require email verification for new users'),
  
}).unknown(); // Allow additional environment variables

// Validate environment variables
const { error, value: envVars } = envVarsSchema.validate(process.env, {
  abortEarly: false, // Show all errors
  stripUnknown: true // Remove unknown variables
});

if (error) {
  console.error('\n❌ Environment validation failed:');
  error.details.forEach(detail => {
    console.error(`   - ${detail.message}`);
  });
  console.error('\n💡 Please check your .env file and ensure all required variables are set correctly.\n');
  process.exit(1);
}

// Build configuration object with proper structure
const config = {
  env: envVars.NODE_ENV,
  isDevelopment: envVars.NODE_ENV === 'development',
  isProduction: envVars.NODE_ENV === 'production',
  isTest: envVars.NODE_ENV === 'test',
  
  app: {
    port: envVars.PORT,
    name: 'BeeKeeper Blog API',
    version: require('../../package.json').version,
  },
  
  database: {
    host: envVars.DB_HOST,
    port: envVars.DB_PORT,
    username: envVars.DB_USER,
    password: envVars.DB_PASSWORD,
    database: envVars.DB_NAME,
    dialect: 'mysql',
    logging: envVars.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: envVars.DB_POOL_MAX,
      min: envVars.DB_POOL_MIN,
      acquire: 30000,
      idle: 10000,
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
    password: envVars.REDIS_PASSWORD,
    options: {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      enableOfflineQueue: true,
    },
  },
  
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      secure: envVars.SMTP_SECURE,
      auth: {
        user: envVars.SMTP_USER,
        pass: envVars.SMTP_PASS,
      },
    },
    from: {
      name: 'BeeKeeper Blog',
      email: envVars.SMTP_USER || 'noreply@beekeeperblog.com',
    },
  },
  
  security: {
    bcryptRounds: envVars.BCRYPT_ROUNDS,
    rateLimiting: {
      enabled: envVars.ENABLE_RATE_LIMITING,
      windowMs: envVars.RATE_LIMIT_WINDOW_MS,
      max: envVars.RATE_LIMIT_MAX_REQUESTS,
    },
  },
  
  cors: {
    origin: envVars.CORS_ORIGIN,
    credentials: envVars.CORS_CREDENTIALS,
    optionsSuccessStatus: 200,
  },
  
  logging: {
    level: envVars.LOG_LEVEL,
    dir: envVars.LOG_DIR,
  },
  
  upload: {
    maxFileSize: envVars.UPLOAD_MAX_FILE_SIZE,
    allowedTypes: envVars.UPLOAD_ALLOWED_TYPES.split(',').map(type => type.trim()),
  },
  
  aws: {
    accessKeyId: envVars.AWS_ACCESS_KEY_ID,
    secretAccessKey: envVars.AWS_SECRET_ACCESS_KEY,
    region: envVars.AWS_REGION,
    s3: {
      bucket: envVars.AWS_S3_BUCKET,
    },
  },
  
  stripe: {
    secretKey: envVars.STRIPE_SECRET_KEY,
    webhookSecret: envVars.STRIPE_WEBHOOK_SECRET,
  },
  
  sendgrid: {
    apiKey: envVars.SENDGRID_API_KEY,
  },
  
  features: {
    swagger: envVars.ENABLE_SWAGGER,
    rateLimiting: envVars.ENABLE_RATE_LIMITING,
    emailVerification: envVars.ENABLE_EMAIL_VERIFICATION,
  },
};

// Freeze configuration to prevent accidental modification
module.exports = Object.freeze(config);
```

---

## 4. Using the Configuration

### In Database Configuration

```javascript
// backend/src/config/database.js
const { Sequelize } = require('sequelize');
const config = require('./environments');
const logger = require('../utils/logger');

// Use validated configuration
const sequelize = new Sequelize({
  ...config.database,
  define: {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

// Connection with retry using config
const connectWithRetry = async (retries = 5) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await sequelize.authenticate();
      logger.info('Database connected successfully', {
        host: config.database.host,
        database: config.database.database,
      });
      return true;
    } catch (err) {
      logger.error(`Database connection attempt ${attempt} failed:`, err.message);
      
      if (attempt < retries) {
        const delay = Math.min(attempt * 1000, 5000);
        logger.info(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw err;
      }
    }
  }
};

module.exports = { sequelize, connectWithRetry };
```

### In Authentication Service

```javascript
// backend/src/services/authService.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/environments');

class AuthService {
  async hashPassword(password) {
    // Use validated bcrypt rounds from config
    return await bcrypt.hash(password, config.security.bcryptRounds);
  }
  
  generateTokens(userId) {
    // Use validated JWT configuration
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
  
  async sendWelcomeEmail(user) {
    // Only send if email is configured
    if (!config.features.emailVerification) {
      return;
    }
    
    // Email configuration is guaranteed to be valid
    await this.emailService.send({
      to: user.email,
      from: config.email.from,
      subject: 'Welcome to BeeKeeper Blog',
      // ...
    });
  }
}
```

### In Express App Setup

```javascript
// backend/src/index.js
const express = require('express');
const config = require('./config/environments');
const logger = require('./utils/logger');

const app = express();

// Use configuration throughout the app
app.use(cors(config.cors));

// Conditional middleware based on features
if (config.features.rateLimiting) {
  app.use('/api', rateLimiters.api);
}

if (config.features.swagger && !config.isProduction) {
  app.use('/api-docs', swaggerRoutes);
}

// Start server with validated port
app.listen(config.app.port, () => {
  logger.info(`${config.app.name} v${config.app.version} running`, {
    environment: config.env,
    port: config.app.port,
    features: config.features,
  });
});
```

### In Rate Limiting

```javascript
// backend/src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');
const config = require('../config/environments');

const createLimiter = (overrides = {}) => {
  // Use validated rate limit configuration
  const options = {
    windowMs: config.security.rateLimiting.windowMs,
    max: config.security.rateLimiting.max,
    enabled: config.security.rateLimiting.enabled,
    ...overrides,
  };
  
  return rateLimit(options);
};

// Different limiters for different endpoints
module.exports = {
  api: createLimiter(),
  auth: createLimiter({ 
    windowMs: 15 * 60 * 1000, 
    max: 5 
  }),
  upload: createLimiter({ 
    windowMs: 60 * 60 * 1000, 
    max: 10 
  }),
};
```

---

## 5. Best Practices

### 1. Environment-Specific Files

```javascript
// Load different .env files based on NODE_ENV
const dotenv = require('dotenv');
const path = require('path');

// Load base .env file
dotenv.config();

// Load environment-specific file
const envFile = `.env.${process.env.NODE_ENV}`;
dotenv.config({ path: path.resolve(process.cwd(), envFile) });
```

### 2. Type-Safe Access

```javascript
// Create typed configuration interface (if using TypeScript)
interface Config {
  env: 'development' | 'test' | 'production';
  app: {
    port: number;
    name: string;
    version: string;
  };
  database: {
    host: string;
    port: number;
    // ... etc
  };
}

// Or use JSDoc for type hints
/**
 * @typedef {Object} Config
 * @property {'development'|'test'|'production'} env
 * @property {Object} app
 * @property {number} app.port
 * @property {string} app.name
 */

/** @type {Config} */
const config = require('./config/environments');
```

### 3. Secret Management

```javascript
// Use different methods for different environments
const getSecrets = async () => {
  if (config.isProduction) {
    // Load from AWS Secrets Manager, Vault, etc.
    const secrets = await loadFromSecretsManager();
    return secrets;
  }
  
  // Use environment variables in dev/test
  return {
    jwtSecret: config.jwt.secret,
    dbPassword: config.database.password,
  };
};
```

### 4. Configuration Validation Helper

```javascript
// backend/src/utils/configValidator.js
const validateRequiredServices = (config) => {
  const errors = [];
  
  // Check Redis connection if caching is enabled
  if (config.features.caching && !config.redis.url) {
    errors.push('Redis URL is required when caching is enabled');
  }
  
  // Check email config if verification is enabled
  if (config.features.emailVerification) {
    if (!config.email.smtp.host || !config.email.smtp.user) {
      errors.push('SMTP configuration is required for email verification');
    }
  }
  
  // Check AWS config if S3 uploads are enabled
  if (config.features.s3Upload) {
    if (!config.aws.accessKeyId || !config.aws.s3.bucket) {
      errors.push('AWS configuration is required for S3 uploads');
    }
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join('\n')}`);
  }
};

// Run additional validation
validateRequiredServices(config);
```

---

## 6. Common Patterns

### Pattern 1: Feature Flags

```javascript
// Use configuration to enable/disable features
if (config.features.emailVerification) {
  router.post('/verify-email', authController.verifyEmail);
}

if (config.features.twoFactorAuth) {
  router.post('/2fa/enable', authController.enableTwoFactor);
}

// In services
class UserService {
  async createUser(data) {
    const user = await User.create(data);
    
    if (config.features.emailVerification) {
      await this.sendVerificationEmail(user);
    }
    
    if (config.features.welcomeBonus) {
      await this.addWelcomeBonus(user);
    }
    
    return user;
  }
}
```

### Pattern 2: Environment-Based Behavior

```javascript
// Different behavior for different environments
class Logger {
  log(level, message, meta) {
    if (config.isTest) {
      // Don't log during tests
      return;
    }
    
    if (config.isDevelopment) {
      // Pretty print in development
      console.log(chalk[level](message), meta);
    } else {
      // JSON logs in production
      winston.log(level, message, meta);
    }
  }
}

// Different email behavior
class EmailService {
  async send(options) {
    if (config.isDevelopment) {
      // Log emails to console in development
      console.log('📧 Email:', options);
      return { messageId: 'dev-123' };
    }
    
    if (config.isTest) {
      // Store in memory for testing
      this.sentEmails.push(options);
      return { messageId: 'test-123' };
    }
    
    // Actually send in production
    return await this.transporter.send(options);
  }
}
```

### Pattern 3: Configuration Helpers

```javascript
// backend/src/config/helpers.js
const config = require('./environments');

// Database URL helper
const getDatabaseUrl = () => {
  const { username, password, host, port, database } = config.database;
  return `mysql://${username}:${password}@${host}:${port}/${database}`;
};

// Redis URL with password
const getRedisUrl = () => {
  const url = new URL(config.redis.url);
  if (config.redis.password) {
    url.password = config.redis.password;
  }
  return url.toString();
};

// Check if feature is enabled
const isFeatureEnabled = (feature) => {
  return config.features[feature] === true;
};

// Get upload limits
const getUploadLimits = () => ({
  fileSize: config.upload.maxFileSize,
  files: 10,
  allowedTypes: config.upload.allowedTypes,
});

module.exports = {
  getDatabaseUrl,
  getRedisUrl,
  isFeatureEnabled,
  getUploadLimits,
};
```

---

## 7. Troubleshooting

### Common Issues and Solutions

#### 1. Environment Variable Not Found

```javascript
// Add debug logging
console.log('Current environment variables:', Object.keys(process.env));
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Looking for .env file:', `.env.${process.env.NODE_ENV}`);
```

#### 2. Validation Errors

```javascript
// Better error reporting
if (error) {
  console.error('\n❌ Configuration Errors:');
  
  const grouped = error.details.reduce((acc, detail) => {
    const category = detail.path[0] || 'general';
    if (!acc[category]) acc[category] = [];
    acc[category].push(detail.message);
    return acc;
  }, {});
  
  Object.entries(grouped).forEach(([category, errors]) => {
    console.error(`\n${category.toUpperCase()}:`);
    errors.forEach(err => console.error(`  - ${err}`));
  });
  
  process.exit(1);
}
```

#### 3. Type Conversion Issues

```javascript
// Custom Joi types for common patterns
const portType = joi.number().port().error(errors => {
  return errors.map(err => {
    if (err.code === 'number.base') {
      return { ...err, message: `"${err.local.label}" must be a valid port number` };
    }
    return err;
  });
});

// Use in schema
PORT: portType.default(8080),
```

#### 4. Missing Required Variables

```javascript
// Create a setup script
// backend/scripts/check-env.js
const requiredVars = [
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET',
];

const missing = requiredVars.filter(varName => !process.env[varName]);

if (missing.length > 0) {
  console.error('Missing required environment variables:');
  missing.forEach(varName => {
    console.error(`- ${varName}`);
  });
  console.error('\nPlease copy .env.example to .env and fill in the values');
  process.exit(1);
}
```

### Debug Mode

```javascript
// Add debug mode to configuration
const config = {
  // ... other config
  debug: {
    showConfig: envVars.DEBUG_SHOW_CONFIG === 'true',
    logSql: envVars.DEBUG_LOG_SQL === 'true',
    verboseErrors: envVars.DEBUG_VERBOSE_ERRORS === 'true',
  },
};

// Use in application
if (config.debug.showConfig && config.isDevelopment) {
  console.log('Current configuration:', JSON.stringify(config, null, 2));
}
```

---

## Summary

Using Joi for environment configuration provides:

1. **Type Safety**: All values are validated and converted to correct types
2. **Documentation**: Schema serves as documentation for required variables
3. **Early Failure**: Application won't start with invalid configuration
4. **Defaults**: Sensible defaults for optional values
5. **Flexibility**: Different configurations for different environments
6. **Security**: Validation prevents injection through environment variables

This approach makes your application more robust, easier to deploy, and reduces configuration-related bugs in production.