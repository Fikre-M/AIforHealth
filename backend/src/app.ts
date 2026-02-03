import express, { Express, Request, Response, NextFunction, RequestHandler } from 'express';
import { env, validateRequiredServices } from '@/config/env';
import { database } from '@/config/database';
import { initializeSentry } from '@/config/sentry';
import aiAssistantRoutes from './routes/aiAssistantRoutes';
import patientRoutes from './routes/patientRoutes';
import authRoutes from './routes/authRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import healthRoutes from './routes/healthRoutes';
import notificationRoutes from './routes/notificationRoutes';
import doctorRoutes from './routes/doctorRoutes';
import adminRoutes from './routes/adminRoutes';
import { errorHandler, notFound } from './middleware/errorHandler';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger';
import { HttpError } from 'http-errors';
import cors, { CorsOptions, CorsRequest } from 'cors';
import { logApp, logError, logInfo } from './utils/logger';

type CustomRequest = Request & {
  user?: any; // You might want to replace 'any' with your User type
};

class App {
  public app: Express;

  constructor() {
    this.app = express();
    
    // Initialize services
    validateRequiredServices();
    initializeSentry();
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Define allowed origins
    const allowedOrigins = [
      'http://localhost:5173', // Vite default port
      'http://localhost:3000', // Common React port
      'http://127.0.0.1:5173', // Alternative localhost
      'http://127.0.0.1:3000', // Alternative localhost
    ];

    // CORS configuration
    const corsOptions: CorsOptions = {
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.includes(origin) || origin.includes('localhost')) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
      exposedHeaders: ['Set-Cookie'],
      optionsSuccessStatus: 200 // Some legacy browsers choke on 204
    };

    // Enable CORS for all routes
    this.app.use(cors(corsOptions));
    
    // Handle preflight requests
    this.app.options('*', cors(corsOptions));
    
    // Add CORS headers to all responses
    this.app.use((req: CustomRequest, res: Response, next: NextFunction) => {
      const origin = req.headers.origin;
      if (origin && (allowedOrigins.includes(origin) || origin.includes('localhost'))) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
      }
      next();
    });
    
    // Parse JSON and URL-encoded bodies
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

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
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: env.NODE_ENV,
        version: '1.0.0'
      });
    });

    // API routes
    this.app.use("/api/v1/auth", authRoutes);
    this.app.use("/api/v1/ai-assistant", aiAssistantRoutes);
    this.app.use("/api/v1/patients", patientRoutes);
    this.app.use("/api/v1/doctors", doctorRoutes);
    this.app.use("/api/v1/admin", adminRoutes);
    this.app.use("/api/v1/appointments", appointmentRoutes);
    this.app.use("/api/v1/health", healthRoutes);
    this.app.use("/api/v1/notifications", notificationRoutes);

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
    logApp.starting(port, env.NODE_ENV);
    
    this.app.listen(port, () => {
      logApp.started(port);
      logInfo(`API Documentation available at http://localhost:${port}/api-docs`);
    });
  }
}

export default App;
