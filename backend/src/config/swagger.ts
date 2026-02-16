// backend/src/config/swagger.ts
import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env";
import apiPaths from "../docs/api-paths";

/**
 * Enhanced Swagger/OpenAPI 3.0 Configuration
 * Complete API documentation with schemas, examples, and detailed descriptions
 */
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "AI for Health API",
    version: "1.0.0",
    description: `
# AI for Health API Documentation

Welcome to the AI for Health API documentation. This API provides comprehensive healthcare management features including:

- **Authentication & Authorization** - Secure user authentication with JWT
- **Doctor Management** - Complete doctor workflow and patient management
- **Appointment Management** - Schedule, manage, and track appointments
- **Health Metrics** - Track and monitor patient health data
- **AI Assistant** - AI-powered health assistance and symptom checking
- **Notifications** - Real-time notifications and reminders
- **Analytics** - Healthcare analytics and reporting

## Authentication

Most endpoints require authentication using JWT (JSON Web Tokens). Include the token in the Authorization header:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## Rate Limiting

API requests are rate-limited to prevent abuse:
- **Default**: 100 requests per 15 minutes per IP
- **Authentication**: 5 requests per 15 minutes per IP
- **Strict endpoints**: 10 requests per 15 minutes per IP

Rate limit headers are included in responses:
- \`X-RateLimit-Limit\`: Maximum requests allowed
- \`X-RateLimit-Remaining\`: Remaining requests
- \`X-RateLimit-Reset\`: Time when limit resets (Unix timestamp)

## Error Handling

All errors follow a consistent format:

\`\`\`json
{
  "status": "error",
  "error": {
    "type": "ERROR_TYPE",
    "message": "Human-readable error message"
  }
}
\`\`\`

Common error types:
- \`NOT_FOUND\` (404)
- \`VALIDATION_ERROR\` (400)
- \`UNAUTHORIZED\` (401)
- \`FORBIDDEN\` (403)
- \`RATE_LIMIT_EXCEEDED\` (429)
- \`INTERNAL_SERVER_ERROR\` (500)

## Pagination

List endpoints support pagination with query parameters:
- \`page\`: Page number (default: 1)
- \`limit\`: Items per page (default: 10, max: 100)

Paginated responses include:

\`\`\`json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
\`\`\`

## Filtering & Sorting

Many endpoints support filtering and sorting:
- \`search\`: Search query
- \`sortBy\`: Field to sort by
- \`sortOrder\`: \`asc\` or \`desc\`
- \`status\`: Filter by status
- \`startDate\` / \`endDate\`: Date range filters

## Versioning

The API is versioned using URL path versioning:
- Current version: \`/api/v1\`
- Future versions will be: \`/api/v2\`, etc.

## Support

For API support, contact: support@aiforhealth.example.com
    `,
    contact: {
      name: "AI for Health Support",
      email: "support@aiforhealth.example.com",
      url: "https://aiforhealth.example.com/support"
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT"
    }
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}/api/v1`,
      description: "Development server"
    },
    {
      url: "https://api-staging.aiforhealth.example.com/api/v1",
      description: "Staging server"
    },
    {
      url: "https://api.aiforhealth.example.com/api/v1",
      description: "Production server"
    }
  ],
  tags: [
    {
      name: "Authentication",
      description: "User authentication and authorization endpoints"
    },
    {
      name: "Doctors",
      description: "Doctor-specific endpoints for managing patients and appointments"
    },
    {
      name: "Patients",
      description: "Patient-specific endpoints for health management"
    },
    {
      name: "Appointments",
      description: "Appointment scheduling and management"
    },
    {
      name: "Health Metrics",
      description: "Health data tracking and monitoring"
    },
    {
      name: "Notifications",
      description: "Notification management"
    },
    {
      name: "AI Assistant",
      description: "AI-powered health assistance"
    },
    {
      name: "Admin",
      description: "Administrative endpoints (admin only)"
    },
    {
      name: "Monitoring",
      description: "System monitoring and health checks"
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT token in the format: Bearer <token>"
      }
    },
    
    parameters: {
      PageParam: {
        name: "page",
        in: "query",
        description: "Page number for pagination",
        required: false,
        schema: {
          type: "integer",
          minimum: 1,
          default: 1
        }
      },
      LimitParam: {
        name: "limit",
        in: "query",
        description: "Number of items per page",
        required: false,
        schema: {
          type: "integer",
          minimum: 1,
          maximum: 100,
          default: 10
        }
      },
      SearchParam: {
        name: "search",
        in: "query",
        description: "Search query string",
        required: false,
        schema: {
          type: "string"
        }
      },
      SortByParam: {
        name: "sortBy",
        in: "query",
        description: "Field to sort by",
        required: false,
        schema: {
          type: "string",
          default: "createdAt"
        }
      },
      SortOrderParam: {
        name: "sortOrder",
        in: "query",
        description: "Sort order",
        required: false,
        schema: {
          type: "string",
          enum: ["asc", "desc"],
          default: "desc"
        }
      }
    },
    
    responses: {
      Success: {
        description: "Successful operation",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: {
                  type: "boolean",
                  example: true
                },
                data: {
                  type: "object"
                }
              }
            }
          }
        }
      },
      
      BadRequest: {
        description: "Bad request - Invalid input",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error"
            },
            example: {
              status: "error",
              error: {
                type: "VALIDATION_ERROR",
                message: "Invalid input data"
              }
            }
          }
        }
      },
      
      Unauthorized: {
        description: "Unauthorized - Authentication required",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error"
            },
            example: {
              status: "error",
              error: {
                type: "UNAUTHORIZED",
                message: "Please authenticate"
              }
            }
          }
        }
      },
      
      Forbidden: {
        description: "Forbidden - Insufficient permissions",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error"
            },
            example: {
              status: "error",
              error: {
                type: "FORBIDDEN",
                message: "Access denied"
              }
            }
          }
        }
      },
      
      NotFound: {
        description: "Not found - Resource doesn't exist",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error"
            },
            example: {
              status: "error",
              error: {
                type: "NOT_FOUND",
                message: "Resource not found"
              }
            }
          }
        }
      },
      
      RateLimitExceeded: {
        description: "Too many requests - Rate limit exceeded",
        headers: {
          "X-RateLimit-Limit": {
            schema: {
              type: "integer"
            },
            description: "Maximum requests allowed"
          },
          "X-RateLimit-Remaining": {
            schema: {
              type: "integer"
            },
            description: "Remaining requests"
          },
          "X-RateLimit-Reset": {
            schema: {
              type: "integer"
            },
            description: "Time when limit resets (Unix timestamp)"
          }
        },
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error"
            },
            example: {
              status: "error",
              error: {
                type: "RATE_LIMIT_EXCEEDED",
                message: "Too many requests, please try again later"
              }
            }
          }
        }
      },
      
      ServerError: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error"
            },
            example: {
              status: "error",
              error: {
                type: "INTERNAL_SERVER_ERROR",
                message: "Internal server error"
              }
            }
          }
        }
      }
    },
    
    schemas: {
      // Error schema
      Error: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["error"],
            example: "error"
          },
          error: {
            type: "object",
            properties: {
              type: {
                type: "string",
                example: "VALIDATION_ERROR"
              },
              message: {
                type: "string",
                example: "Invalid input data"
              }
            }
          }
        }
      },
      
      // Pagination schema
      Pagination: {
        type: "object",
        properties: {
          page: {
            type: "integer",
            example: 1
          },
          limit: {
            type: "integer",
            example: 10
          },
          total: {
            type: "integer",
            example: 100
          },
          pages: {
            type: "integer",
            example: 10
          }
        }
      },
      
      // User schema
      User: {
        type: "object",
        properties: {
          _id: {
            type: "string",
            example: "65f1234567890abcdef12345"
          },
          name: {
            type: "string",
            example: "John Doe"
          },
          email: {
            type: "string",
            format: "email",
            example: "john.doe@example.com"
          },
          role: {
            type: "string",
            enum: ["patient", "doctor", "admin"],
            example: "patient"
          },
          isActive: {
            type: "boolean",
            example: true
          },
          isEmailVerified: {
            type: "boolean",
            example: true
          },
          phone: {
            type: "string",
            example: "+1234567890"
          },
          dateOfBirth: {
            type: "string",
            format: "date",
            example: "1990-01-15"
          },
          gender: {
            type: "string",
            enum: ["male", "female", "other"],
            example: "male"
          },
          address: {
            type: "string",
            example: "123 Main St, City, State 12345"
          },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2024-01-15T10:00:00.000Z"
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            example: "2024-02-01T10:00:00.000Z"
          }
        }
      },
      
      // Authentication schemas
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: {
            type: "string",
            minLength: 2,
            maxLength: 50,
            example: "John Doe"
          },
          email: {
            type: "string",
            format: "email",
            example: "john.doe@example.com"
          },
          password: {
            type: "string",
            minLength: 8,
            format: "password",
            example: "SecurePassword123!"
          },
          role: {
            type: "string",
            enum: ["patient", "doctor"],
            default: "patient",
            example: "patient"
          }
        }
      },
      
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "john.doe@example.com"
          },
          password: {
            type: "string",
            format: "password",
            example: "SecurePassword123!"
          }
        }
      },
      
      AuthResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true
          },
          data: {
            type: "object",
            properties: {
              user: {
                $ref: "#/components/schemas/User"
              },
              token: {
                type: "string",
                example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              },
              refreshToken: {
                type: "string",
                example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              }
            }
          }
        }
      },
      
      // Appointment schemas
      Appointment: {
        type: "object",
        properties: {
          _id: {
            type: "string",
            example: "65f1234567890abcdef12345"
          },
          patient: {
            type: "object",
            properties: {
              _id: {
                type: "string"
              },
              name: {
                type: "string"
              },
              email: {
                type: "string"
              }
            }
          },
          doctor: {
            type: "object",
            properties: {
              _id: {
                type: "string"
              },
              name: {
                type: "string"
              },
              email: {
                type: "string"
              }
            }
          },
          appointmentDate: {
            type: "string",
            format: "date-time",
            example: "2024-03-15T10:00:00.000Z"
          },
          duration: {
            type: "integer",
            example: 30,
            description: "Duration in minutes"
          },
          status: {
            type: "string",
            enum: ["scheduled", "confirmed", "in_progress", "completed", "missed", "cancelled", "rescheduled"],
            example: "scheduled"
          },
          type: {
            type: "string",
            enum: ["consultation", "follow_up", "emergency", "routine_checkup", "specialist", "telemedicine"],
            example: "consultation"
          },
          reason: {
            type: "string",
            example: "Regular checkup"
          },
          notes: {
            type: "string",
            example: "Patient reports mild headaches"
          },
          createdAt: {
            type: "string",
            format: "date-time"
          },
          updatedAt: {
            type: "string",
            format: "date-time"
          }
        }
      },
      
      CreateAppointmentRequest: {
        type: "object",
        required: ["patientId", "doctorId", "appointmentDate", "reason"],
        properties: {
          patientId: {
            type: "string",
            example: "65f1234567890abcdef12345"
          },
          doctorId: {
            type: "string",
            example: "65f1234567890abcdef12346"
          },
          appointmentDate: {
            type: "string",
            format: "date-time",
            example: "2024-03-15T10:00:00.000Z"
          },
          duration: {
            type: "integer",
            minimum: 15,
            maximum: 240,
            default: 30,
            example: 30
          },
          type: {
            type: "string",
            enum: ["consultation", "follow_up", "emergency", "routine_checkup", "specialist", "telemedicine"],
            default: "consultation",
            example: "consultation"
          },
          reason: {
            type: "string",
            maxLength: 500,
            example: "Regular checkup"
          },
          symptoms: {
            type: "array",
            items: {
              type: "string"
            },
            example: ["headache", "fatigue"]
          },
          notes: {
            type: "string",
            maxLength: 1000,
            example: "Patient reports mild symptoms"
          },
          isEmergency: {
            type: "boolean",
            default: false,
            example: false
          }
        }
      },
      
      // Health Metric schemas
      HealthMetric: {
        type: "object",
        properties: {
          _id: {
            type: "string"
          },
          user: {
            type: "string"
          },
          type: {
            type: "string",
            enum: ["blood_pressure", "heart_rate", "temperature", "weight", "blood_sugar", "oxygen_saturation"],
            example: "blood_pressure"
          },
          value: {
            type: "number",
            example: 120
          },
          unit: {
            type: "string",
            example: "mmHg"
          },
          recordedAt: {
            type: "string",
            format: "date-time"
          },
          notes: {
            type: "string"
          }
        }
      }
    }
  },
  
  // Merge API paths from separate file
  paths: apiPaths,
  
  security: [
    {
      bearerAuth: []
    }
  ]
};

/**
 * Swagger/OpenAPI Configuration Options
 * Combines definition with JSDoc annotations from route files
 */
const options: swaggerJsdoc.Options = {
  definition: swaggerDefinition,
  // Scan route files for JSDoc annotations
  apis: ["./src/routes/*.ts", "./src/models/*.ts", "./src/controllers/*.ts"],
};

export const specs = swaggerJsdoc(options);
