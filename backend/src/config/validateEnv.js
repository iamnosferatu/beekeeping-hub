// backend/src/config/validateEnv.js
const Joi = require('joi');

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(8080),
  
  // Database
  DB_HOST: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  
  // JWT
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRE: Joi.string().default('30d'),
  
  // URLs
  BACKEND_URL: Joi.string().uri().required(),
  FRONTEND_URL: Joi.string().uri().required(),
  CORS_ORIGIN: Joi.string().uri().required(),
  
  // Email (required in production)
  SMTP_HOST: Joi.string().when('NODE_ENV', { is: 'production', then: Joi.required() }),
  SMTP_PORT: Joi.number().when('NODE_ENV', { is: 'production', then: Joi.required() }),
  SMTP_SECURE: Joi.boolean().when('NODE_ENV', { is: 'production', then: Joi.required() }),
  SMTP_USER: Joi.string().when('NODE_ENV', { is: 'production', then: Joi.required() }),
  SMTP_PASS: Joi.string().when('NODE_ENV', { is: 'production', then: Joi.required() }),
  SMTP_FROM: Joi.string().when('NODE_ENV', { is: 'production', then: Joi.required() }),
  
  // Upload
  MAX_FILE_SIZE: Joi.number().default(5000000),
  UPLOAD_PATH: Joi.string().default('./uploads'),
  
  // Logging
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info')
}).unknown(true);

const validateEnvironment = () => {
  const { error, value } = envSchema.validate(process.env);
  
  if (error) {
    console.error('❌ Environment validation failed:');
    console.error(error.details.map(detail => `  - ${detail.message}`).join('\n'));
    process.exit(1);
  }
  
  console.log('✅ Environment validation passed');
  return value;
};

module.exports = { validateEnvironment };