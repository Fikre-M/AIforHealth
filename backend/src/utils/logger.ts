import winston from 'winston';
import { env } from '@/config/env';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`
  )
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: 'logs/combined.log',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
];

// Create the logger
export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  levels,
  format,
  transports,
  // Don't exit on handled exceptions
  exitOnError: false,
});

// Create a stream object for Morgan HTTP logging
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Helper functions for structured logging
export const logError = (message: string, error?: Error, meta?: any) => {
  logger.error(message, { error: error?.message, stack: error?.stack, ...meta });
};

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};

export const logHttp = (message: string, meta?: any) => {
  logger.http(message, meta);
};

// Database operation logging
export const logDatabase = {
  connect: (uri: string) => logger.info('🔌 Connecting to database', { uri: uri.replace(/\/\/.*@/, '//***:***@') }),
  connected: () => logger.info('✅ Database connected successfully'),
  disconnect: () => logger.info('🔌 Database disconnected'),
  error: (error: Error) => logger.error('❌ Database error', { error: error.message, stack: error.stack }),
  query: (operation: string, collection: string, duration?: number) => {
    logger.debug('📊 Database query', { operation, collection, duration });
  },
};

// Authentication logging
export const logAuth = {
  login: (userId: string, email: string, ip?: string) => {
    logger.info('🔐 User login', { userId, email, ip });
  },
  logout: (userId: string, email: string) => {
    logger.info('🚪 User logout', { userId, email });
  },
  register: (userId: string, email: string, role: string) => {
    logger.info('👤 User registered', { userId, email, role });
  },
  failed: (email: string, reason: string, ip?: string) => {
    logger.warn('🚫 Authentication failed', { email, reason, ip });
  },
  tokenRefresh: (userId: string) => {
    logger.debug('🔄 Token refreshed', { userId });
  },
};

// API request logging
export const logApi = {
  request: (method: string, url: string, userId?: string, ip?: string) => {
    logger.http('📥 API Request', { method, url, userId, ip });
  },
  response: (method: string, url: string, statusCode: number, duration: number) => {
    logger.http('📤 API Response', { method, url, statusCode, duration });
  },
  error: (method: string, url: string, error: Error, userId?: string) => {
    logger.error('💥 API Error', { method, url, error: error.message, userId, stack: error.stack });
  },
};

// Security logging
export const logSecurity = {
  rateLimitExceeded: (ip: string, endpoint: string) => {
    logger.warn('🚨 Rate limit exceeded', { ip, endpoint });
  },
  suspiciousActivity: (description: string, userId?: string, ip?: string) => {
    logger.warn('⚠️  Suspicious activity detected', { description, userId, ip });
  },
  accountLocked: (userId: string, email: string, attempts: number) => {
    logger.warn('🔒 Account locked', { userId, email, attempts });
  },
};

// Application lifecycle logging
export const logApp = {
  starting: (port: number, env: string) => {
    logger.info('🚀 Application starting', { port, environment: env });
  },
  started: (port: number) => {
    logger.info('✅ Application started successfully', { port });
  },
  stopping: () => {
    logger.info('🛑 Application stopping');
  },
  stopped: () => {
    logger.info('✅ Application stopped gracefully');
  },
  error: (error: Error) => {
    logger.error('💥 Application error', { error: error.message, stack: error.stack });
  },
};

// Legacy stream for backward compatibility
export const stream = morganStream;

export default logger;
