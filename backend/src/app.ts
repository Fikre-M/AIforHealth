import express, { Express } from "express";
import { env } from "@/config/env";
import { database } from "@/config/database";
import aiAssistantRoutes from "./routes/aiAssistantRoutes";
import patientRoutes from "./routes/patientRoutes";
import {
  errorHandler,
  notFound,
  handleUnhandledRejection,
  handleUncaughtException,
} from "./middleware/errorHandler";
import swaggerUi from "swagger-ui-express";
import { specs } from "./config/swagger";

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
    this.app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(specs, {
        explorer: true,
        customCss: ".swagger-ui .topbar { display: none }",
        customSiteTitle: "AI for Health API",
      })
    );
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use("/api/v1/ai-assistant", aiAssistantRoutes);
    this.app.use("/api/v1/patients", patientRoutes);

    // 404 handler
    this.app.use(notFound);
  }

  private initializeErrorHandling(): void {
    // Error handling
    this.app.use(errorHandler);

    // Handle unhandled promise rejections
    process.on("unhandledRejection", handleUnhandledRejection);

    // Handle uncaught exceptions
    process.on("uncaughtException", handleUncaughtException);
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
