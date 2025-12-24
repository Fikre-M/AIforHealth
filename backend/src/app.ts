import express, { Express } from 'express';
import { env } from '@/config/env';
import { database } from '@/config/database';
import {
  errorHandler,
  notFound,
  rateLimiter,
  security,
  logger,
  authErrorHandler,
} from '@/middleware';
import routes from '@/routes';

class App {
  public app: Express;

  constructor() {
    this.app = express();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Security middleware
    security(this.app);

    // Rate limiting
    this.app.use(rateLimiter);

    // Logging
    this.app.use(logger);

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Response time header
    this.app.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        if (!res.headersSent) {
          res.setHeader('X-Response-Time', duration);
        }
      });
      next();
    });
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use(`/api/${env.API_VERSION}`, routes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        data: {
          message: 'AIforHealth Backend API',
          version: env.API_VERSION,
          environment: env.NODE_ENV,
        },
      });
    });
  }

  private initializeErrorHandling(): void {
    // Auth-specific error handler (before general error handler)
    this.app.use(authErrorHandler);

    // 404 handler
    this.app.use(notFound);

    // Global error handler
    this.app.use(errorHandler);
  }

  public async connectDatabase(): Promise<void> {
    await database.connect();
  }

  public async disconnectDatabase(): Promise<void> {
    await database.disconnect();
  }
}

export default App;