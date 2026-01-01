import express, { Express, Request, Response, NextFunction, RequestHandler } from 'express';
import { env } from '@/config/env';
import { database } from '@/config/database';
import aiAssistantRoutes from './routes/aiAssistantRoutes';
import patientRoutes from './routes/patientRoutes';
import authRoutes from './routes/authRoutes';
import { errorHandler, notFound } from './middleware/errorHandler';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger';
import { HttpError } from 'http-errors';
import cors, { CorsOptions, CorsRequest } from 'cors';

type CustomRequest = Request & {
  user?: any; // You might want to replace 'any' with your User type
};

class App {
  public app: Express;

  constructor() {
    this.app = express();
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
    // API routes
    this.app.use("/api/v1/auth", authRoutes);
    this.app.use("/api/v1/ai-assistant", aiAssistantRoutes);
    this.app.use("/api/v1/patients", patientRoutes);

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
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      // Consider logging the error or sending it to an error tracking service
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (error: Error) => {
      console.error('Uncaught Exception:', error);
      // Consider logging the error or sending it to an error tracking service
      process.exit(1);
    });
  }

  public async connectDatabase(): Promise<void> {
    try {
      await database.connect();
      console.log("Database connected successfully");
    } catch (error) {
      console.error("Database connection error:", error);
      process.exit(1);
    }
  }

  public async disconnectDatabase(): Promise<void> {
    try {
      await database.disconnect();
      console.log("Database disconnected successfully");
    } catch (error) {
      console.error("Error disconnecting database:", error);
      process.exit(1);
    }
  }

  public start(): void {
    const port = env.PORT || 5000;
    this.app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(
        `API Documentation available at http://localhost:${port}/api-docs`
      );
    });
  }
}

export default App;
