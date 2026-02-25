import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '@/utils/apiResponse';
import { logger } from '@/utils/logger';

// Custom error classes
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  errors?: any[];

  constructor(message: string, statusCode: number = 400, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', errors?: any[]) {
    super(message, 400, errors);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409);
  }
}

/**
 * Error handler middleware
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default error values
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: any[] | undefined;

  // If it's our AppError, use its properties
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err.name === 'ValidationError') {
    // Handle Mongoose validation errors
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values((err as any).errors).map((e: any) => ({
      field: e.path,
      message: e.message,
      value: e.value,
    }));
  } else if (err.name === 'CastError') {
    // Handle Mongoose cast errors (invalid ID)
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (err.name === 'JsonWebTokenError') {
    // Handle JWT errors
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    // Handle expired JWT
    statusCode = 401;
    message = 'Token expired';
  }

  // Log error
  logger.error('Error Handler:', {
    statusCode,
    message,
    errors,
    stack: err.stack,
    path: req.path,
    method: req.method,
    requestId: req.id,
  });

  // Send standardized error response
  ResponseUtil.error(res, message, statusCode, errors);
};

/**
 * 404 Not Found handler
 */
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  ResponseUtil.notFound(res, 'Endpoint');
};

// import { Request, Response, NextFunction } from 'express';
// import { AppError, ErrorType } from '@/utils/AppError';
// import { env } from '@/config/env';
// import { logger } from '@/utils/logger';

// interface ErrorResponse {
//   status: string;
//   error: {
//     type: string;
//     message: string;
//     stack?: string;
//     details?: any;
//   };
// }

// export const errorHandler = (
//   err: any,
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   let error = { ...err };
//   error.message = err.message;

//   // Log the error
//   logger.error(`[${new Date().toISOString()}] ${err.stack || err}`);

//   // Handle specific error types
//   if (err.name === 'CastError') {
//     const message = `Resource not found with id of ${err.value}`;
//     error = new AppError(message, 404);
//   }

//   // Handle duplicate field values
//   if (err.code === 11000) {
//     const field = Object.keys(err.keyValue)[0];
//     const message = `Duplicate field value: ${field}. Please use another value.`;
//     error = new AppError(message, 400);
//   }

//   // Handle validation errors
//   if (err.name === 'ValidationError') {
//     const messages = Object.values(err.errors).map((val: any) => val.message);
//     const message = `Invalid input data: ${messages.join('. ')}`;
//     error = new AppError(message, 400);
//   }

//   // Handle JWT errors
//   if (err.name === 'JsonWebTokenError') {
//     const message = 'Invalid token. Please log in again.';
//     error = new AppError(message, 401);
//   }

//   if (err.name === 'TokenExpiredError') {
//     const message = 'Your token has expired. Please log in again.';
//     error = new AppError(message, 401);
//   }

//   // Set default status code and message if not set
//   const statusCode = error.statusCode || 500;
//   const message = error.message || 'Internal Server Error';

//   // Prepare error response
//   const errorResponse: ErrorResponse = {
//     status: error.status || 'error',
//     error: {
//       type: error.name || err.name || 'INTERNAL_SERVER_ERROR',
//       message,
//     },
//   };

//   // Include stack trace in development
//   if (env.NODE_ENV === 'development') {
//     errorResponse.error.stack = err.stack;
//   }

//   // Include validation errors if any
//   if (err.errors) {
//     errorResponse.error.details = err.errors;
//   }

//   // Send error response
//   res.status(statusCode).json(errorResponse);
// };

// // 404 Handler
// export const notFound = (req: Request, res: Response, next: NextFunction) => {
//   const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
//   next(error);
// };

// // Async handler wrapper
// export const asyncHandler = (fn: Function) =>
//   (req: Request, res: Response, next: NextFunction) => {
//     Promise.resolve(fn(req, res, next)).catch(next);
//   };

// // Handle unhandled rejections
// export const handleUnhandledRejection = (reason: any, promise: Promise<any>) => {
//   logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
//   // Consider throwing to let the process crash and be restarted by PM2/forever
//   // throw reason;
// };

// // Handle uncaught exceptions
// export const handleUncaughtException = (error: Error) => {
//   logger.error('Uncaught Exception:', error);
//   // Consider exiting the process and let it be restarted
//   // process.exit(1);
// };
