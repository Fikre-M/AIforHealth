import express, { Express, Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { env } from "@/config/env";
import { database } from "@/config/database";
import aiAssistantRoutes from "./routes/aiAssistantRoutes";
import patientRoutes from "./routes/patientRoutes";
import authRoutes from "./routes/authRoutes";
import { errorHandler, notFound } from "./middleware/errorHandler";
import swaggerUi from "swagger-ui-express";
import { specs } from "./config/swagger";
import { HttpError } from 'http-errors';

class App {
  public app: Express;

  constructor() {
    this.app = express();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Basic middleware
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
