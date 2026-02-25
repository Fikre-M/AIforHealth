// import express, { Express, Request, Response, NextFunction, ErrorRequestHandler } from 'express';
// import { env, validateRequiredServices } from '@/config/env';
// import { database } from '@/config/database';
// import { initializeSentry } from '@/config/sentry';
// import setupSecurity from './middleware/security';
// import rateLimiter from './middleware/rateLimiter';
// import { errorHandler, notFound } from './middleware/errorHandler';
// import { requestLogger, performanceMonitor, requestId, securityLogger } from './middleware/requestLogger';
// import { initializeErrorMonitoring } from './utils/errorMonitoring';
// import swaggerUi from 'swagger-ui-express';
// import { specs } from './config/swagger';
// import { logApp, logInfo, logError } from './utils/logger';

// class App {
//   public app: Express;

//   constructor() {
//     this.app = express();
    
//     // Initialize services
//     validateRequiredServices();
//     initializeSentry();
//     initializeErrorMonitoring();
    
//     this.initializeMiddleware();
//     this.initializeRoutes();
//     this.initializeErrorHandling();
//   }

//   private initializeMiddleware(): void {
//     // Request ID for tracing
//     this.app.use(requestId);

//     // Performance monitoring
//     this.app.use(performanceMonitor);

//     // Security logging
//     this.app.use(securityLogger);

//     // Request logging
//     this.app.use(requestLogger);

//     // Enhanced security middleware (Helmet, CORS, HTTPS enforcement)
//     setupSecurity(this.app);
    
//     // Parse JSON and URL-encoded bodies
//     this.app.use(express.json({ limit: '10mb' }));
//     this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

//     // Swagger UI
//     const swaggerOptions = {
//       explorer: true,
//       customCss: ".swagger-ui .topbar { display: none }",
//       customSiteTitle: "AI for Health API",
//     };
    
//     const swaggerUiHandler = swaggerUi.setup(specs, swaggerOptions);
//     this.app.use("/api-docs", swaggerUi.serve, swaggerUiHandler);
//   }

//   private initializeRoutes(): void {
//     // Health check endpoint (no auth required)
//     this.app.get('/health', (_req: Request, res: Response) => {
//       res.json({
//         status: 'OK',
//         timestamp: new Date().toISOString(),
//         uptime: process.uptime(),
//         environment: env['NODE_ENV'],
//         version: '1.0.0'
//       });
//     });

//     // API routes with rate limiting on sensitive endpoints
//     this.app.use("/api/v1", rateLimiter, require('./routes').default);

//     // 404 handler
//     this.app.use((req: Request, res: Response, next: NextFunction) => {
//       notFound(req, res, next);
//     });
//   }

//   private initializeErrorHandling(): void {
//     // Error handling
//     this.app.use(errorHandler as ErrorRequestHandler);

//     // Handle unhandled promise rejections
//     process.on("unhandledRejection", (reason: unknown, promise: Promise<unknown>) => {
//       logError('Unhandled Rejection', new Error(String(reason)), { promise });
//     });

//     // Handle uncaught exceptions
//     process.on("uncaughtException", (error: Error) => {
//       logError('Uncaught Exception', error);
//       process.exit(1);
//     });
//   }

//   public async connectDatabase(): Promise<void> {
//     try {
//       await database.connect();
//       logInfo("Database connected successfully");
//     } catch (error) {
//       logError("Database connection error", error as Error);
//       process.exit(1);
//     }
//   }

//   public async disconnectDatabase(): Promise<void> {
//     try {
//       await database.disconnect();
//       logInfo("Database disconnected successfully");
//     } catch (error) {
//       logError("Error disconnecting database", error as Error);
//       process.exit(1);
//     }
//   }

//   public start(): void {
//     const port = env.PORT || 5000;
//     logApp.starting(port, env['NODE_ENV']);
    
//     this.app.listen(port, () => {
//       logApp.started(port);
//       logInfo(`API Documentation available at http://localhost:${port}/api-docs`);
//     });
//   }
// }

// export default App;

// backend/src/app.ts
import express, { Express, Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { env, validateRequiredServices } from '@/config/env';
import { database } from '@/config/database';
import { initializeSentry } from '@/config/sentry';
import setupSecurity from './middleware/security';
import rateLimiter from './middleware/rateLimiter';
import { errorHandler, notFound } from './middleware/errorHandler';
import { requestLogger, performanceMonitor, requestId, securityLogger } from './middleware/requestLogger';
import { initializeErrorMonitoring } from './utils/errorMonitoring';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger';
import { logApp, logInfo, logError } from './utils/logger';

// Import enhanced security components
import { 
  rateLimiters,
  additionalSecurityHeaders,
  sanitizeMongo,
  sanitizeXSS,
  preventSQLInjection,
  sanitizeFileUpload,
  enforceHttps,
  monitorCertificate,
  suspiciousActivityMonitor,
  csrfProtection,
  csrfErrorHandler,
  auditLoggers,
  ipWhitelist,
  doubleSubmitCookie,
  cspViolationHandler,
  encryptRequestBody,
  decryptRequestBody
} from './middleware/security';

// Import Redis for distributed rate limiting
import Redis from 'ioredis';

class App {
  public app: Express;
  private redisClient: Redis.Redis | null = null;

  constructor() {
    this.app = express();
    
    // Initialize services
    validateRequiredServices();
    initializeSentry();
    initializeErrorMonitoring();
    
    this.initializeRedis();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialize Redis for distributed rate limiting and session storage
   */
  private async initializeRedis(): Promise<void> {
    if (env.REDIS_URL) {
      try {
        this.redisClient = new Redis(env.REDIS_URL);
        
        this.redisClient.on('connect', () => {
          logInfo('Redis connected successfully');
        });
        
        this.redisClient.on('error', (error) => {
          logError('Redis connection error', error);
        });
      } catch (error) {
        logError('Failed to initialize Redis', error as Error);
      }
    }
  }

  private initializeMiddleware(): void {
    // Trust proxy (for rate limiting behind reverse proxy)
    this.app.set('trust proxy', 1);

    // === TIER 1: SECURITY & MONITORING (Execute first) ===
    
    // Request ID for tracing
    this.app.use(requestId);

    // HTTPS Enforcement (production only)
    if (env.NODE_ENV === 'production') {
      this.app.use(enforceHttps);
      this.app.use(monitorCertificate);
    }

    // Performance monitoring
    this.app.use(performanceMonitor);

    // Suspicious activity monitoring
    this.app.use(suspiciousActivityMonitor);

    // Security headers
    setupSecurity(this.app); // Your existing security setup
    this.app.use(additionalSecurityHeaders); // Enhanced headers

    // Security logging
    this.app.use(securityLogger);

    // Request logging
    this.app.use(requestLogger);

    // === TIER 2: BODY PARSERS ===
    
    // Parse JSON and URL-encoded bodies with size limits
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // === TIER 3: DATA SANITIZATION ===
    
    // Sanitize data against injections
    this.app.use(sanitizeMongo);
    this.app.use(sanitizeXSS);
    this.app.use(preventSQLInjection);
    this.app.use(sanitizeFileUpload);

    // === TIER 4: CSRF PROTECTION (except for stateless endpoints) ===
    
    // CSRF token endpoint (exempt from CSRF protection)
    this.app.get('/api/v1/auth/csrf-token', (req, res) => {
      res.json({ 
        success: true, 
        csrfToken: req.csrfToken ? req.csrfToken() : null 
      });
    });

    // Apply CSRF protection to state-changing operations
    if (env.NODE_ENV === 'production') {
      this.app.use('/api/v1', (req, res, next) => {
        // Skip CSRF for GET, HEAD, OPTIONS and auth endpoints
        const skipMethods = ['GET', 'HEAD', 'OPTIONS'];
        const skipPaths = ['/api/v1/auth/login', '/api/v1/auth/register', '/api/v1/auth/forgot-password'];
        
        if (skipMethods.includes(req.method) || skipPaths.includes(req.path)) {
          return next();
        }
        
        csrfProtection(req, res, next);
      });
      this.app.use(csrfErrorHandler);
    }

    // === TIER 5: RATE LIMITING ===
    
    // Apply different rate limiters based on endpoint sensitivity
    this.app.use('/api/', rateLimiters.api); // Your existing rate limiter
    
    // Stricter limits for auth endpoints
    this.app.use('/api/v1/auth/login', rateLimiters.auth);
    this.app.use('/api/v1/auth/register', rateLimiters.auth);
    this.app.use('/api/v1/auth/forgot-password', rateLimiters.passwordReset);
    this.app.use('/api/v1/auth/reset-password', rateLimiters.passwordReset);
    this.app.use('/api/v1/auth/verify-otp', rateLimiters.otp);
    
    // Endpoint-specific rate limiters
    this.app.use('/api/v1/appointments', rateLimiters.endpoint.sensitive);
    this.app.use('/api/v1/patients', rateLimiters.endpoint.sensitive);
    
    // Read-only endpoints get lighter limits
    this.app.use('/api/v1/search', rateLimiters.endpoint.readOnly);
    
    // File upload limits
    this.app.use('/api/v1/upload', rateLimiters.endpoint.upload);

    // === TIER 6: IP WHITELISTING FOR ADMIN ENDPOINTS ===
    
    if (env.ADMIN_IPS) {
      const adminIPs = env.ADMIN_IPS.split(',');
      this.app.use('/api/v1/admin', ipWhitelist(adminIPs));
    }

    // === TIER 7: ENCRYPTION FOR SENSITIVE DATA ===
    
    // Decrypt incoming sensitive data
    this.app.use('/api/v1/patients', decryptRequestBody(['ssn', 'medicalHistory', 'insuranceDetails']));
    this.app.use('/api/v1/users', decryptRequestBody(['paymentInfo', 'bankDetails']));

    // === TIER 8: CSP VIOLATION REPORTING ===
    
    this.app.post('/api/v1/security/csp-violation', cspViolationHandler);
    this.app.post('/api/v1/security/expect-ct-violation', cspViolationHandler);

    // Swagger UI (public, no security needed)
    const swaggerOptions = {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "AI for Health API",
    };
    
    const swaggerUiHandler = swaggerUi.setup(specs, swaggerOptions);
    this.app.use("/api-docs", swaggerUi.serve, swaggerUiHandler);
  }

  private initializeRoutes(): void {
    // Public health check endpoint (no security)
    this.app.get('/health', (_req: Request, res: Response) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: env['NODE_ENV'],
        version: '1.0.0',
        security: {
          csrf: env.NODE_ENV === 'production',
          rateLimiting: true,
          https: env.NODE_ENV === 'production'
        }
      });
    });

    // Security status endpoint (monitoring)
    this.app.get('/security/status', (req: Request, res: Response) => {
      res.json({
        success: true,
        data: {
          rateLimits: {
            api: '100 per 15 minutes',
            auth: '5 per 15 minutes',
            passwordReset: '3 per hour'
          },
          headers: {
            hsts: env.NODE_ENV === 'production',
            csp: true,
            xssProtection: true
          },
          sanitization: true,
          csrf: env.NODE_ENV === 'production'
        }
      });
    });

    // API routes with audit logging
    const apiRouter = require('./routes').default;
    
    // Apply audit logging to all API routes
    this.app.use("/api/v1", (req, res, next) => {
      // Log all API requests for audit
      if (req.user) {
        auditLoggers.crud.read('api')(req, res, next);
      } else {
        next();
      }
    }, apiRouter);

    // 404 handler
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      notFound(req, res, next);
    });
  }

  private initializeErrorHandling(): void {
    // Error handling
    this.app.use(errorHandler as ErrorRequestHandler);

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason: unknown, promise: Promise<unknown>) => {
      logError('Unhandled Rejection', new Error(String(reason)), { 
        promise,
        timestamp: new Date().toISOString()
      });
      
      // Track for monitoring
      if (this.redisClient) {
        this.redisClient.incr('unhandled_rejections');
      }
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (error: Error) => {
      logError('Uncaught Exception', error, {
        timestamp: new Date().toISOString()
      });
      
      // Graceful shutdown
      this.gracefulShutdown(1);
    });

    // Handle SIGTERM
    process.on('SIGTERM', () => {
      logInfo('SIGTERM received, starting graceful shutdown');
      this.gracefulShutdown(0);
    });

    // Handle SIGINT
    process.on('SIGINT', () => {
      logInfo('SIGINT received, starting graceful shutdown');
      this.gracefulShutdown(0);
    });
  }

  /**
   * Graceful shutdown handler
   */
  private async gracefulShutdown(exitCode: number): Promise<void> {
    logInfo('Graceful shutdown initiated');
    
    // Stop accepting new requests
    this.app.disable('trust proxy');
    
    // Close Redis connection
    if (this.redisClient) {
      await this.redisClient.quit();
      logInfo('Redis connection closed');
    }
    
    // Close database connection
    await this.disconnectDatabase();
    
    logInfo('Graceful shutdown completed');
    process.exit(exitCode);
  }

  public async connectDatabase(): Promise<void> {
    try {
      await database.connect();
      logInfo("Database connected successfully");
      
      // Store connection status in Redis
      if (this.redisClient) {
        await this.redisClient.set('db_status', 'connected');
        await this.redisClient.expire('db_status', 60);
      }
    } catch (error) {
      logError("Database connection error", error as Error);
      
      // Store error in Redis for monitoring
      if (this.redisClient) {
        await this.redisClient.incr('db_connection_errors');
      }
      
      process.exit(1);
    }
  }

  public async disconnectDatabase(): Promise<void> {
    try {
      await database.disconnect();
      logInfo("Database disconnected successfully");
      
      if (this.redisClient) {
        await this.redisClient.set('db_status', 'disconnected');
      }
    } catch (error) {
      logError("Error disconnecting database", error as Error);
    }
  }

  public start(): void {
    const port = env.PORT || 5000;
    logApp.starting(port, env['NODE_ENV']);
    
    const server = this.app.listen(port, () => {
      logApp.started(port);
      logInfo(`API Documentation available at http://localhost:${port}/api-docs`);
      logInfo(`Security Status: ${env.NODE_ENV === 'production' ? '🔒 Production' : '🔓 Development'}`);
      
      if (env.NODE_ENV === 'production') {
        logInfo('HTTPS: Enabled');
        logInfo('HSTS: Enabled');
        logInfo('CSRF Protection: Enabled');
        logInfo('Rate Limiting: Enabled');
      }
    });

    // Increase timeout for production
    if (env.NODE_ENV === 'production') {
      server.timeout = 120000; // 2 minutes
    }

    return server;
  }
}

export default App;