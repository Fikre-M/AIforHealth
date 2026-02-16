// backend/src/config/swagger.ts
import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env";
import { swaggerSpec } from "./swagger.enhanced";
import apiPaths from "../docs/api-paths";

/**
 * Swagger/OpenAPI Configuration
 * Combines enhanced spec with JSDoc annotations from route files
 */
const options: swaggerJsdoc.Options = {
  definition: {
    ...swaggerSpec,
    // Merge API paths from separate file
    paths: apiPaths,
    // Update server URLs with actual port
    servers: [
      {
        url: `http://localhost:${env.PORT}/api/v1`,
        description: "Development server",
      },
      {
        url: "https://api-staging.aiforhealth.example.com/api/v1",
        description: "Staging server",
      },
      {
        url: "https://api.aiforhealth.example.com/api/v1",
        description: "Production server",
      },
    ],
  },
  // Scan route files for JSDoc annotations
  apis: ["./src/routes/*.ts", "./src/models/*.ts", "./src/controllers/*.ts"],
};

export const specs = swaggerJsdoc(options);
