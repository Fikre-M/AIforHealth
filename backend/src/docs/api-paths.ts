/**
 * OpenAPI Path Definitions
 * Complete API endpoint documentation with request/response examples
 */

export const apiPaths = {
  // Authentication Endpoints
  "/auth/register": {
    post: {
      tags: ["Authentication"],
      summary: "Register a new user",
      description: "Create a new user account. Default role is 'patient'.",
      operationId: "register",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/RegisterRequest"
            },
            examples: {
              patient: {
                summary: "Register as patient",
                value: {
                  name: "John Doe",
                  email: "john.doe@example.com",
                  password: "SecurePassword123!",
                  role: "patient"
                }
              },
              doctor: {
                summary: "Register as doctor",
                value: {
                  name: "Dr. Jane Smith",
                  email: "dr.smith@example.com",
                  password: "SecurePassword123!",
                  role: "doctor"
                }
              }
            }
          }
        }
      },
      responses: {
        "201": {
          description: "User registered successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AuthResponse"
              },
              example: {
                success: true,
                data: {
                  user: {
                    _id: "65f1234567890abcdef12345",
                    name: "John Doe",
                    email: "john.doe@example.com",
                    role: "patient",
                    isActive: true,
                    isEmailVerified: false,
                    createdAt: "2024-02-16T10:00:00.000Z"
                  },
                  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                  refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                }
              }
            }
          }
        },
        "400": {
          $ref: "#/components/responses/BadRequest"
        },
        "409": {
          description: "User already exists",
          content: {
            "application/json": {
              example: {
                status: "error",
                error: {
                  type: "DUPLICATE_KEY",
                  message: "User with this email already exists"
                }
              }
            }
          }
        },
        "429": {
          $ref: "#/components/responses/RateLimitExceeded"
        }
      }
    }
  },

  "/auth/login": {
    post: {
      tags: ["Authentication"],
      summary: "Login user",
      description: "Authenticate user and receive JWT tokens",
      operationId: "login",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/LoginRequest"
            },
            example: {
              email: "john.doe@example.com",
              password: "SecurePassword123!"
            }
          }
        }
      },
      responses: {
        "200": {
          description: "Login successful",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AuthResponse"
              }
            }
          }
        },
        "400": {
          $ref: "#/components/responses/BadRequest"
        },
        "401": {
          description: "Invalid credentials",
          content: {
            "application/json": {
              example: {
                status: "error",
                error: {
                  type: "UNAUTHORIZED",
                  message: "Invalid email or password"
                }
              }
            }
          }
        },
        "429": {
          $ref: "#/components/responses/RateLimitExceeded"
        }
      }
    }
  },

  "/auth/refresh-token": {
    post: {
      tags: ["Authentication"],
      summary: "Refresh access token",
      description: "Get a new access token using refresh token",
      operationId: "refreshToken",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["refreshToken"],
              properties: {
                refreshToken: {
                  type: "string",
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                }
              }
            }
          }
        }
      },
      responses: {
        "200": {
          description: "Token refreshed successfully",
          content: {
            "application/json": {
              example: {
                success: true,
                data: {
                  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                  refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                }
              }
            }
          }
        },
        "401": {
          $ref: "#/components/responses/Unauthorized"
        }
      }
    }
  },

  "/auth/logout": {
    post: {
      tags: ["Authentication"],
      summary: "Logout user",
      description: "Invalidate current session",
      operationId: "logout",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Logout successful",
          content: {
            "application/json": {
              example: {
                success: true,
                message: "Logged out successfully"
              }
            }
          }
        },
        "401": {
          $ref: "#/components/responses/Unauthorized"
        }
      }
    }
  },

  "/auth/profile": {
    get: {
      tags: ["Authentication"],
      summary: "Get user profile",
      description: "Get current user's profile information",
      operationId: "getProfile",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Profile retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean"
                  },
                  data: {
                    $ref: "#/components/schemas/User"
                  }
                }
              }
            }
          }
        },
        "401": {
          $ref: "#/components/responses/Unauthorized"
        }
      }
    },
    put: {
      tags: ["Authentication"],
      summary: "Update user profile",
      description: "Update current user's profile information",
      operationId: "updateProfile",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  example: "John Updated Doe"
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
                }
              }
            }
          }
        }
      },
      responses: {
        "200": {
          description: "Profile updated successfully",
          content: {
            "application/json": {
              example: {
                success: true,
                message: "Profile updated successfully",
                data: {
                  _id: "65f1234567890abcdef12345",
                  name: "John Updated Doe",
                  email: "john.doe@example.com",
                  phone: "+1234567890",
                  updatedAt: "2024-02-16T10:30:00.000Z"
                }
              }
            }
          }
        },
        "400": {
          $ref: "#/components/responses/BadRequest"
        },
        "401": {
          $ref: "#/components/responses/Unauthorized"
        }
      }
    }
  },

  // Doctor Endpoints
  "/doctors/stats": {
    get: {
      tags: ["Doctors"],
      summary: "Get doctor statistics",
      description: "Get dashboard statistics for the logged-in doctor",
      operationId: "getDoctorStats",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Statistics retrieved successfully",
          content: {
            "application/json": {
              example: {
                success: true,
                data: {
                  todayAppointments: 5,
                  weekAppointments: 23,
                  monthAppointments: 87,
                  totalPatients: 156,
                  completedAppointments: 432,
                  cancelledAppointments: 23,
                  totalAppointments: 460
                }
              }
            }
          }
        },
        "401": {
          $ref: "#/components/responses/Unauthorized"
        },
        "403": {
          $ref: "#/components/responses/Forbidden"
        }
      }
    }
  },

  "/doctors/appointments/daily": {
    get: {
      tags: ["Doctors"],
      summary: "Get today's appointments",
      description: "Get all appointments scheduled for today for the logged-in doctor",
      operationId: "getDailyAppointments",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Appointments retrieved successfully",
          content: {
            "application/json": {
              example: {
                success: true,
                count: 5,
                data: [
                  {
                    _id: "65f1234567890abcdef12345",
                    patient: {
                      _id: "65f1234567890abcdef12346",
                      name: "John Doe",
                      email: "john@example.com"
                    },
                    appointmentDate: "2024-02-16T10:00:00.000Z",
                    duration: 30,
                    status: "scheduled",
                    type: "consultation",
                    reason: "Regular checkup"
                  }
                ]
              }
            }
          }
        },
        "401": {
          $ref: "#/components/responses/Unauthorized"
        },
        "403": {
          $ref: "#/components/responses/Forbidden"
        }
      }
    }
  },

  "/doctors/appointments/upcoming": {
    get: {
      tags: ["Doctors"],
      summary: "Get upcoming appointments",
      description: "Get paginated list of upcoming appointments for the logged-in doctor",
      operationId: "getUpcomingAppointments",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          $ref: "#/components/parameters/PageParam"
        },
        {
          $ref: "#/components/parameters/LimitParam"
        }
      ],
      responses: {
        "200": {
          description: "Appointments retrieved successfully",
          content: {
            "application/json": {
              example: {
                success: true,
                count: 10,
                total: 45,
                data: [],
                pagination: {
                  page: 1,
                  limit: 10,
                  total: 45,
                  pages: 5
                }
              }
            }
          }
        },
        "401": {
          $ref: "#/components/responses/Unauthorized"
        },
        "403": {
          $ref: "#/components/responses/Forbidden"
        }
      }
    }
  },

  "/doctors/patients": {
    get: {
      tags: ["Doctors"],
      summary: "Get patients list",
      description: "Get paginated, searchable list of patients for the logged-in doctor",
      operationId: "getPatientsList",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          $ref: "#/components/parameters/PageParam"
        },
        {
          $ref: "#/components/parameters/LimitParam"
        },
        {
          $ref: "#/components/parameters/SearchParam"
        }
      ],
      responses: {
        "200": {
          description: "Patients retrieved successfully",
          content: {
            "application/json": {
              example: {
                success: true,
                patients: [
                  {
                    _id: "65f1234567890abcdef12346",
                    name: "John Doe",
                    email: "john@example.com",
                    phone: "+1234567890",
                    age: 34,
                    gender: "male",
                    medicalHistory: ["Hypertension"],
                    allergies: ["Penicillin"],
                    currentMedications: ["Lisinopril"]
                  }
                ],
                total: 156,
                pagination: {
                  page: 1,
                  limit: 10,
                  total: 156,
                  pages: 16
                }
              }
            }
          }
        },
        "401": {
          $ref: "#/components/responses/Unauthorized"
        },
        "403": {
          $ref: "#/components/responses/Forbidden"
        }
      }
    },
    post: {
      tags: ["Doctors"],
      summary: "Create new patient",
      description: "Create a new patient account (doctor-created patient)",
      operationId: "createPatient",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "email", "password"],
              properties: {
                name: {
                  type: "string",
                  example: "Jane Smith"
                },
                email: {
                  type: "string",
                  format: "email",
                  example: "jane.smith@example.com"
                },
                password: {
                  type: "string",
                  format: "password",
                  example: "SecurePassword123!"
                },
                phone: {
                  type: "string",
                  example: "+1234567892"
                },
                dateOfBirth: {
                  type: "string",
                  format: "date",
                  example: "1990-08-22"
                },
                gender: {
                  type: "string",
                  enum: ["male", "female", "other"],
                  example: "female"
                },
                medicalHistory: {
                  type: "array",
                  items: {
                    type: "string"
                  },
                  example: ["Migraine"]
                },
                allergies: {
                  type: "array",
                  items: {
                    type: "string"
                  },
                  example: []
                },
                currentMedications: {
                  type: "array",
                  items: {
                    type: "string"
                  },
                  example: ["Sumatriptan"]
                }
              }
            }
          }
        }
      },
      responses: {
        "201": {
          description: "Patient created successfully",
          content: {
            "application/json": {
              example: {
                success: true,
                message: "Patient created successfully",
                data: {
                  _id: "65f1234567890abcdef12347",
                  name: "Jane Smith",
                  email: "jane.smith@example.com",
                  role: "patient",
                  createdBy: "65f1234567890abcdef12340",
                  createdAt: "2024-02-16T10:00:00.000Z"
                }
              }
            }
          }
        },
        "400": {
          $ref: "#/components/responses/BadRequest"
        },
        "401": {
          $ref: "#/components/responses/Unauthorized"
        },
        "403": {
          $ref: "#/components/responses/Forbidden"
        },
        "409": {
          description: "Patient already exists",
          content: {
            "application/json": {
              example: {
                status: "error",
                error: {
                  type: "DUPLICATE_KEY",
                  message: "User with this email already exists"
                }
              }
            }
          }
        }
      }
    }
  },

  "/doctors/patients/{patientId}": {
    get: {
      tags: ["Doctors"],
      summary: "Get patient details",
      description: "Get detailed information about a specific patient",
      operationId: "getPatientDetails",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "patientId",
          in: "path",
          required: true,
          description: "Patient ID",
          schema: {
            type: "string",
            example: "65f1234567890abcdef12346"
          }
        }
      ],
      responses: {
        "200": {
          description: "Patient details retrieved successfully",
          content: {
            "application/json": {
              example: {
                success: true,
                data: {
                  _id: "65f1234567890abcdef12346",
                  name: "John Doe",
                  email: "john@example.com",
                  phone: "+1234567890",
                  dateOfBirth: "1990-01-15",
                  gender: "male",
                  address: "123 Main St",
                  emergencyContact: {
                    name: "Jane Doe",
                    phone: "+1234567891",
                    relationship: "spouse"
                  },
                  medicalHistory: ["Hypertension"],
                  allergies: ["Penicillin"],
                  currentMedications: ["Lisinopril"]
                }
              }
            }
          }
        },
        "401": {
          $ref: "#/components/responses/Unauthorized"
        },
        "403": {
          $ref: "#/components/responses/Forbidden"
        },
        "404": {
          $ref: "#/components/responses/NotFound"
        }
      }
    },
    patch: {
      tags: ["Doctors"],
      summary: "Update patient information",
      description: "Update patient's medical information",
      operationId: "updatePatient",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "patientId",
          in: "path",
          required: true,
          description: "Patient ID",
          schema: {
            type: "string"
          }
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                medicalHistory: {
                  type: "array",
                  items: {
                    type: "string"
                  }
                },
                allergies: {
                  type: "array",
                  items: {
                    type: "string"
                  }
                },
                currentMedications: {
                  type: "array",
                  items: {
                    type: "string"
                  }
                }
              }
            }
          }
        }
      },
      responses: {
        "200": {
          description: "Patient updated successfully"
        },
        "401": {
          $ref: "#/components/responses/Unauthorized"
        },
        "403": {
          $ref: "#/components/responses/Forbidden"
        },
        "404": {
          $ref: "#/components/responses/NotFound"
        }
      }
    }
  },

  // Appointments Endpoints
  "/appointments": {
    get: {
      tags: ["Appointments"],
      summary: "Get appointments",
      description: "Get paginated list of appointments with filtering",
      operationId: "getAppointments",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          $ref: "#/components/parameters/PageParam"
        },
        {
          $ref: "#/components/parameters/LimitParam"
        },
        {
          name: "status",
          in: "query",
          description: "Filter by status",
          schema: {
            type: "string",
            enum: ["scheduled", "confirmed", "in_progress", "completed", "missed", "cancelled"]
          }
        },
        {
          name: "startDate",
          in: "query",
          description: "Filter by start date",
          schema: {
            type: "string",
            format: "date"
          }
        },
        {
          name: "endDate",
          in: "query",
          description: "Filter by end date",
          schema: {
            type: "string",
            format: "date"
          }
        }
      ],
      responses: {
        "200": {
          description: "Appointments retrieved successfully",
          content: {
            "application/json": {
              example: {
                success: true,
                count: 10,
                total: 50,
                data: [],
                pagination: {
                  page: 1,
                  limit: 10,
                  total: 50,
                  pages: 5
                }
              }
            }
          }
        },
        "401": {
          $ref: "#/components/responses/Unauthorized"
        }
      }
    },
    post: {
      tags: ["Appointments"],
      summary: "Create appointment",
      description: "Schedule a new appointment",
      operationId: "createAppointment",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/CreateAppointmentRequest"
            }
          }
        }
      },
      responses: {
        "201": {
          description: "Appointment created successfully",
          content: {
            "application/json": {
              example: {
                success: true,
                message: "Appointment created successfully",
                data: {
                  _id: "65f1234567890abcdef12345",
                  patient: {
                    _id: "65f1234567890abcdef12346",
                    name: "John Doe"
                  },
                  doctor: {
                    _id: "65f1234567890abcdef12347",
                    name: "Dr. Smith"
                  },
                  appointmentDate: "2024-03-15T10:00:00.000Z",
                  duration: 30,
                  status: "scheduled",
                  type: "consultation",
                  reason: "Regular checkup",
                  createdAt: "2024-02-16T10:00:00.000Z"
                }
              }
            }
          }
        },
        "400": {
          $ref: "#/components/responses/BadRequest"
        },
        "401": {
          $ref: "#/components/responses/Unauthorized"
        },
        "409": {
          description: "Doctor not available",
          content: {
            "application/json": {
              example: {
                status: "error",
                error: {
                  type: "CONFLICT",
                  message: "Doctor is not available at the requested time"
                }
              }
            }
          }
        }
      }
    }
  },

  "/appointments/{appointmentId}": {
    get: {
      tags: ["Appointments"],
      summary: "Get appointment details",
      description: "Get detailed information about a specific appointment",
      operationId: "getAppointmentById",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "appointmentId",
          in: "path",
          required: true,
          description: "Appointment ID",
          schema: {
            type: "string"
          }
        }
      ],
      responses: {
        "200": {
          description: "Appointment retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean"
                  },
                  data: {
                    $ref: "#/components/schemas/Appointment"
                  }
                }
              }
            }
          }
        },
        "401": {
          $ref: "#/components/responses/Unauthorized"
        },
        "404": {
          $ref: "#/components/responses/NotFound"
        }
      }
    },
    patch: {
      tags: ["Appointments"],
      summary: "Update appointment",
      description: "Update appointment details",
      operationId: "updateAppointment",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "appointmentId",
          in: "path",
          required: true,
          schema: {
            type: "string"
          }
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                appointmentDate: {
                  type: "string",
                  format: "date-time"
                },
                status: {
                  type: "string",
                  enum: ["scheduled", "confirmed", "in_progress", "completed", "cancelled"]
                },
                notes: {
                  type: "string"
                },
                doctorNotes: {
                  type: "string"
                }
              }
            }
          }
        }
      },
      responses: {
        "200": {
          description: "Appointment updated successfully"
        },
        "400": {
          $ref: "#/components/responses/BadRequest"
        },
        "401": {
          $ref: "#/components/responses/Unauthorized"
        },
        "404": {
          $ref: "#/components/responses/NotFound"
        }
      }
    },
    delete: {
      tags: ["Appointments"],
      summary: "Cancel appointment",
      description: "Cancel an appointment",
      operationId: "cancelAppointment",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "appointmentId",
          in: "path",
          required: true,
          schema: {
            type: "string"
          }
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["cancellationReason"],
              properties: {
                cancellationReason: {
                  type: "string",
                  example: "Patient unavailable"
                }
              }
            }
          }
        }
      },
      responses: {
        "200": {
          description: "Appointment cancelled successfully"
        },
        "400": {
          $ref: "#/components/responses/BadRequest"
        },
        "401": {
          $ref: "#/components/responses/Unauthorized"
        },
        "404": {
          $ref: "#/components/responses/NotFound"
        }
      }
    }
  },

  // Monitoring Endpoints
  "/monitoring/health": {
    get: {
      tags: ["Monitoring"],
      summary: "Health check",
      description: "Get application health status",
      operationId: "getHealthStatus",
      responses: {
        "200": {
          description: "Health status retrieved successfully",
          content: {
            "application/json": {
              example: {
                success: true,
                data: {
                  status: "healthy",
                  timestamp: "2024-02-16T10:00:00.000Z",
                  uptime: 3600,
                  environment: "production",
                  version: "1.0.0",
                  services: {
                    database: {
                      connected: true,
                      state: "connected"
                    }
                  }
                }
              }
            }
          }
        },
        "503": {
          description: "Service unavailable",
          content: {
            "application/json": {
              example: {
                success: false,
                data: {
                  status: "unhealthy",
                  services: {
                    database: {
                      connected: false
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

export default apiPaths;
