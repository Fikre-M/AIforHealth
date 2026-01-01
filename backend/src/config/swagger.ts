// backend/src/config/swagger.ts
import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AI for Health API",
      version: "1.0.0",
      description: "API documentation for AI for Health application",
      contact: {
        name: "AI for Health Support",
        email: "support@aiforhealth.example.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api`,
        description: "Development server",
      },
      {
        url: "https://api.aiforhealth.example.com/api",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      responses: {
        UnauthorizedError: {
          description: "Access token is missing or invalid",
        },
      },
      schemas: {
        // Common schemas will be added here
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/models/*.ts", "./src/controllers/*.ts"],
};

export const specs = swaggerJsdoc(options);
