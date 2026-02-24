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
    // Request ID for tracing
    this.app.use(requestId);

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

    // API routes with rate limiting on sensitive endpoints
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
      process.exit(1);
    }
  }

  public start(): void {
    const port = env.PORT || 5000;
    logApp.starting(port, env['NODE_ENV']);
    
    this.app.listen(port, () => {
      logApp.started(port);
      logInfo(`API Documentation available at http://localhost:${port}/api-docs`);
    });
  }
}

export default App;
