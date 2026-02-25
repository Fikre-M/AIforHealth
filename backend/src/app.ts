import express, { Express, Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { env, validateRequiredServices } from '@/config/env';
import { database } from '@/config/database';
import { initializeSentry } from '@/config/sentry';
import { errorHandler, notFound } from './middleware/errorHandler';
import { requestLogger, performanceMonitor, requestId, securityLogger } from './middleware/requestLogger';
import { initializeErrorMonitoring } from './utils/errorMonitoring';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger';
import { logApp, logInfo, logError } from './utils/logger';
import { responseMiddleware } from './middleware/responseMiddleware';

// Import security middleware
import { setupSecurity } from './middleware/security';
import rateLimiter from './middleware/rateLimiter';

class App {
  public app: Express;

  constructor() {
    this.app = express();
    
    // Initialize services
    validateRequiredServices();
    initializeSentry();
    initializeErrorMonitoring();
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Trust proxy for rate limiting behind reverse proxy
    this.app.set('trust proxy', 1);

    // Request ID for tracing
    this.app.use(requestId);

    // Response middleware for standardized responses
    this.app.use(responseMiddleware);

    // Performance monitoring
    this.app.use(performanceMonitor);

    // Security logging
    this.app.use(securityLogger);

    // Request logging
    this.app.use(requestLogger);

    // Enhanced security middleware (Helmet, CORS, HTTPS enforcement)
    setupSecurity(this.app);
    
    // Parse JSON and URL-encoded bodies
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Swagger UI
    const swaggerOptions = {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "AI for Health API",
    };
    
    const swaggerUiHandler = swaggerUi.setup(specs, swaggerOptions);
    this.app.use("/api-docs", swaggerUi.serve, swaggerUiHandler);
  }

  private initializeRoutes(): void {
    // Health check endpoint (no auth required)
    this.app.get('/health', (_req: Request, res: Response) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: env['NODE_ENV'],
        version: '1.0.0'
      });
    });

    // API routes with rate limiting
    this.app.use("/api/v1", rateLimiter, require('./routes').default);

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
      logError('Unhandled Rejection', new Error(String(reason)), { promise });
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (error: Error) => {
      logError('Uncaught Exception', error);
      process.exit(1);
    });

    // Handle SIGTERM for graceful shutdown
    process.on('SIGTERM', () => {
      logInfo('SIGTERM received, starting graceful shutdown');
      this.gracefulShutdown(0);
    });

    // Handle SIGINT for graceful shutdown
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
    
    try {
      // Close database connection
      await this.disconnectDatabase();
      logInfo('Graceful shutdown completed');
    } catch (error) {
      logError('Error during graceful shutdown', error as Error);
    }
    
    process.exit(exitCode);
  }

  public async connectDatabase(): Promise<void> {
    try {
      await database.connect();
      logInfo("Database connected successfully");
    } catch (error) {
      logError("Database connection error", error as Error);
      process.exit(1);
    }
  }

  public async disconnectDatabase(): Promise<void> {
    try {
      await database.disconnect();
      logInfo("Database disconnected successfully");
    } catch (error) {
      logError("Error disconnecting database", error as Error);
    }
  }

  public start() {
    const port = env.PORT || 5000;
    logApp.starting(port, env['NODE_ENV']);
    
    const server = this.app.listen(port, () => {
      logApp.started(port);
      logInfo(`API Documentation available at http://localhost:${port}/api-docs`);
    });

    // Set timeout for production
    if (env.NODE_ENV === 'production') {
      server.timeout = 120000; // 2 minutes
    }

    return server;
  }
}

export default App;