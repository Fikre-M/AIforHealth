import express, { Express } from 'express';
import { env } from '@/config/env';
import { database } from '@/config/database';
import aiAssistantRoutes from "./routes/aiAssistantRoutes";
import patientRoutes from './routes/patientRoutes';
import { errorHandler, notFound, handleUnhandledRejection, handleUncaughtException } from './middleware/errorHandler';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger';




// Add this after other middleware but before routes
app.use('/api-docs', 
  swaggerUi.serve, 
  swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'AI for Health API'
  })
);




// Add this before other route handlers
app.use(express.json());

// Add this after all other route handlers
app.use(notFound);
app.use(errorHandler);

// Add error handling for unhandled rejections and exceptions
process.on('unhandledRejection', handleUnhandledRejection);
process.on('uncaughtException', handleUncaughtException);




app.use('/api/patients', patientRoutes);


app.use('/api/doctors', doctorRoutes);

// ... other middleware
app.use("/api/ai", aiAssistantRoutes);
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