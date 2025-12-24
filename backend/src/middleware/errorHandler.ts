import { Request, Response, NextFunction } from 'express';
import { env, isProduction } from '@/config/env';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  }

  // Mongoose duplicate key error
  if (error.name === 'MongoServerError' && (error as any).code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value';
  }

  // Mongoose cast error
  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Log error in development
  if (!isProduction) {
    console.error('Error:', {
      message: error.message,
      stack: error.stack,
      statusCode,
      url: req.url,
      method: req.method,
    });
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(isProduction ? {} : { stack: error.stack }),
    },
  });
};

export default errorHandler;