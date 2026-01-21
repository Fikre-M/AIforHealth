import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment validation schema
const envSchema = z.object({
  // Server Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default(5000),
  API_VERSION: z.string().default('v1'),

  // Database Configuration
  MONGODB_URI: z.string().min(1, 'MongoDB URI is required'),
  MONGODB_TEST_URI: z.string().optional(),
  MONGODB_MAX_POOL_SIZE: z.string().transform(Number).default(20),
  MONGODB_MIN_POOL_SIZE: z.string().transform(Number).default(5),
  MONGODB_MAX_IDLE_TIME_MS: z.string().transform(Number).default(30000),
  MONGODB_SERVER_SELECTION_TIMEOUT_MS: z.string().transform(Number).default(10000),
  MONGODB_RETRY_WRITES: z.string().transform(val => val === 'true').default(true),
  MONGODB_WRITE_CONCERN: z.string().default('majority'),

  // JWT Configuration
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT refresh secret must be at least 32 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // Security
  BCRYPT_SALT_ROUNDS: z.string().transform(Number).default(12),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default(100),

  // CORS Configuration
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Error Monitoring
  SENTRY_DSN: z.string().optional(),
  SENTRY_ENVIRONMENT: z.string().default('development'),

  // Email Service
  SENDGRID_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),
  FROM_NAME: z.string().optional(),

  // SMS Service
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),

  // AI Services
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4'),
  OPENAI_MAX_TOKENS: z.string().transform(Number).default(1000),

  // File Storage
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_S3_BUCKET: z.string().optional(),

  // Payment Processing
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Redis
  REDIS_URL: z.string().optional(),
});

// Validate and parse environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join('\n');
      
      console.error('❌ Environment validation failed:');
      console.error(errorMessages);
      process.exit(1);
    }
    throw error;
  }
};

export const env = parseEnv();

// Environment helper functions
export const isDevelopment = () => env.NODE_ENV === 'development';
export const isProduction = () => env.NODE_ENV === 'production';
export const isTest = () => env.NODE_ENV === 'test';

// Validate required services based on environment
export const validateRequiredServices = () => {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (isProduction()) {
    // Required in production
    if (!env.SENTRY_DSN) errors.push('SENTRY_DSN is required in production');
    if (!env.SENDGRID_API_KEY) warnings.push('SENDGRID_API_KEY not set - email features will be disabled');
    if (!env.OPENAI_API_KEY) warnings.push('OPENAI_API_KEY not set - AI features will be disabled');
    if (!env.STRIPE_SECRET_KEY) warnings.push('STRIPE_SECRET_KEY not set - payment features will be disabled');
    if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
      warnings.push('AWS credentials not set - file upload will be disabled');
    }
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Configuration warnings:');
    warnings.forEach(warning => console.warn(`   ${warning}`));
  }

  if (errors.length > 0) {
    console.error('❌ Configuration errors:');
    errors.forEach(error => console.error(`   ${error}`));
    process.exit(1);
  }

  if (warnings.length === 0 && errors.length === 0) {
    console.log('✅ Environment configuration validated successfully');
  }
};

export default env;