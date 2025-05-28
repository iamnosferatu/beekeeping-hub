const joi = require("joi");

// Validation schema for environment variables
const envVarsSchema = joi
  .object({
    NODE_ENV: joi
      .string()
      .valid("development", "test", "production")
      .default("development"),
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
    JWT_EXPIRE: joi.string().default("30d"),
    JWT_REFRESH_SECRET: joi.string().min(32).required(),
    JWT_REFRESH_EXPIRE: joi.string().default("90d"),

    // Redis
    REDIS_URL: joi.string().default("redis://localhost:6379"),

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
    CORS_ORIGIN: joi.string().default("http://localhost:3000"),

    // Logging
    LOG_LEVEL: joi
      .string()
      .valid("error", "warn", "info", "debug")
      .default("info"),
  })
  .unknown();

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
