// import { Request, Response, NextFunction } from 'express';
// import { env, isProduction } from '@/config/env';

// export interface AppError extends Error {
//   statusCode?: number;
//   isOperational?: boolean;
// }

// const errorHandler = (
//   error: AppError,
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): void => {
//   let statusCode = error.statusCode || 500;
//   let message = error.message || 'Internal Server Error';

//   // Mongoose validation error
//   if (error.name === 'ValidationError') {
//     statusCode = 400;
//     message = 'Validation Error';
//   }

//   // Mongoose duplicate key error
//   if (error.name === 'MongoServerError' && (error as any).code === 11000) {
//     statusCode = 409;
//     message = 'Duplicate field value';
//   }

//   // Mongoose cast error
//   if (error.name === 'CastError') {
//     statusCode = 400;
//     message = 'Invalid ID format';
//   }

//   // JWT errors
//   if (error.name === 'JsonWebTokenError') {
//     statusCode = 401;
//     message = 'Invalid token';
//   }

//   if (error.name === 'TokenExpiredError') {
//     statusCode = 401;
//     message = 'Token expired';
//   }

//   // Log error in development
//   if (!isProduction) {
//     console.error('Error:', {
//       message: error.message,
//       stack: error.stack,
//       statusCode,
//       url: req.url,
//       method: req.method,
//     });
//   }

//   res.status(statusCode).json({
//     success: false,
//     error: {
//       message,
//       ...(isProduction ? {} : { stack: error.stack }),
//     },
//   });
// };

// export default errorHandler;

// backend/src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorType } from '@/utils/AppError';
import { env } from '@/config/env';
import { logger } from './logger';

interface ErrorResponse {
  status: string;
  error: {
    type: string;
    message: string;
    stack?: string;
    details?: any;
  };
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log the error
  logger.error(`[${new Date().toISOString()}] ${err.stack || err}`);

  // Handle specific error types
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new AppError(message, 404);
  }

  // Handle duplicate field values
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value: ${field}. Please use another value.`;
    error = new AppError(message, 400);
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val: any) => val.message);
    const message = `Invalid input data: ${messages.join('. ')}`;
    error = new AppError(message, 400);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again.';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Your token has expired. Please log in again.';
    error = new AppError(message, 401);
  }

  // Set default status code and message if not set
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Prepare error response
  const errorResponse: ErrorResponse = {
    status: error.status || 'error',
    error: {
      type: err.name || 'INTERNAL_SERVER_ERROR',
      message,
    },
  };

  // Include stack trace in development
  if (env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  // Include validation errors if any
  if (err.errors) {
    errorResponse.error.details = err.errors;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

// 404 Handler
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

// Async handler wrapper
export const asyncHandler = (fn: Function) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Handle unhandled rejections
export const handleUnhandledRejection = (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Consider throwing to let the process crash and be restarted by PM2/forever
  // throw reason;
};

// Handle uncaught exceptions
export const handleUncaughtException = (error: Error) => {
  logger.error('Uncaught Exception:', error);
  // Consider exiting the process and let it be restarted
  // process.exit(1);
};