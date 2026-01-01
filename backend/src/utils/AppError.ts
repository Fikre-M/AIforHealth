// backend/src/utils/AppError.ts
export class AppError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Common error types
export const ErrorType = {
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  BAD_REQUEST: "BAD_REQUEST",
  DUPLICATE_KEY: "DUPLICATE_KEY",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
} as const;

export type ErrorType = (typeof ErrorType)[keyof typeof ErrorType];

// Error factory function
export const createError = (
  type: ErrorType,
  message: string,
  statusCode: number
) => {
  const error = new AppError(message, statusCode);
  error.name = type;
  return error;
};

// Common error instances
export const Errors = {
  notFound: (message = "Resource not found") =>
    createError(ErrorType.NOT_FOUND, message, 404),
  validationError: (message = "Validation failed") =>
    createError(ErrorType.VALIDATION_ERROR, message, 400),
  unauthorized: (message = "Please authenticate") =>
    createError(ErrorType.UNAUTHORIZED, message, 401),
  forbidden: (message = "Access denied") =>
    createError(ErrorType.FORBIDDEN, message, 403),
  serverError: (message = "Internal server error") =>
    createError(ErrorType.INTERNAL_SERVER_ERROR, message, 500),
  badRequest: (message = "Bad request") =>
    createError(ErrorType.BAD_REQUEST, message, 400),
  duplicateKey: (message = "Duplicate key error") =>
    createError(ErrorType.DUPLICATE_KEY, message, 400),
  rateLimitExceeded: (message = "Too many requests, please try again later") =>
    createError(ErrorType.RATE_LIMIT_EXCEEDED, message, 429),
};
