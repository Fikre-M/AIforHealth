import { Response } from 'express';
import { logger } from './logger';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{
    field?: string;
    message: string;
    code?: string;
    value?: any;
  }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    responseTime?: number;
    version?: string;
  };
}

export interface PaginationOptions {
  page: number;
  limit: number;
  total: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class ResponseUtil {
  private static getRequestId(res: Response): string | undefined {
    return res.locals?.requestId || res.req?.id;
  }

  private static getResponseTime(res: Response): number | undefined {
    if (res.locals?.startTime) {
      return Date.now() - res.locals.startTime;
    }
    return undefined;
  }

  private static getVersion(): string {
    return process.env.API_VERSION || 'v1';
  }

  /**
   * Success response with data
   */
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: number = 200,
    meta?: Record<string, any>
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: this.getRequestId(res),
        responseTime: this.getResponseTime(res),
        version: this.getVersion(),
        ...meta,
      },
    };

    // Log success response in development
    if (process.env.NODE_ENV === 'development') {
      logger.debug('API Response', {
        statusCode,
        message,
        requestId: response.meta?.requestId,
      });
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Success response with no data
   */
  static successNoData(
    res: Response,
    message: string = 'Success',
    statusCode: number = 200
  ): Response {
    return this.success(res, null, message, statusCode);
  }

  /**
   * Error response with detailed errors
   */
  static error(
    res: Response,
    message: string,
    statusCode: number = 400,
    errors?: Array<{ field?: string; message: string; code?: string; value?: any }> | string | Error
  ): Response {
    let formattedErrors: Array<{ field?: string; message: string; code?: string; value?: any }> =
      [];

    if (Array.isArray(errors)) {
      formattedErrors = errors;
    } else if (errors instanceof Error) {
      formattedErrors = [
        {
          message: errors.message,
          code: errors.name,
        },
      ];
    } else if (typeof errors === 'string') {
      formattedErrors = [
        {
          message: errors,
        },
      ];
    }

    const response: ApiResponse = {
      success: false,
      message,
      errors: formattedErrors.length > 0 ? formattedErrors : undefined,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: this.getRequestId(res),
        responseTime: this.getResponseTime(res),
        version: this.getVersion(),
      },
    };

    // Log error response
    logger.error('API Error Response', {
      statusCode,
      message,
      errors: formattedErrors,
      requestId: response.meta?.requestId,
      path: res.req?.path,
      method: res.req?.method,
    });

    return res.status(statusCode).json(response);
  }

  /**
   * Paginated response with data array
   */
  static paginated<T>(
    res: Response,
    data: T[],
    pagination: PaginationOptions,
    message: string = 'Success',
    statusCode: number = 200,
    additionalMeta?: Record<string, any>
  ): Response {
    const { page, limit, total, sortBy, sortOrder } = pagination;
    const pages = Math.ceil(total / limit);
    const hasNext = page < pages;
    const hasPrev = page > 1;

    const response: ApiResponse<T[]> = {
      success: true,
      data,
      message,
      pagination: {
        page,
        limit,
        total,
        pages,
        hasNext,
        hasPrev,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: this.getRequestId(res),
        responseTime: this.getResponseTime(res),
        version: this.getVersion(),
        sortBy,
        sortOrder,
        ...additionalMeta,
      },
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Created response (201) with location header
   */
  static created<T>(
    res: Response,
    data: T,
    message: string = 'Resource created successfully',
    location?: string
  ): Response {
    if (location) {
      res.location(location);
    }
    return this.success(res, data, message, 201);
  }

  /**
   * Accepted response (202) for async operations
   */
  static accepted(res: Response, message: string = 'Request accepted', data?: any): Response {
    return this.success(res, data, message, 202);
  }

  /**
   * No content response (204)
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  // Standard error responses
  static badRequest(res: Response, message: string = 'Bad request', errors?: any): Response {
    return this.error(res, message, 400, errors);
  }

  static unauthorized(res: Response, message: string = 'Unauthorized', errors?: any): Response {
    return this.error(res, message, 401, errors);
  }

  static forbidden(res: Response, message: string = 'Forbidden', errors?: any): Response {
    return this.error(res, message, 403, errors);
  }

  static notFound(res: Response, resource: string = 'Resource', errors?: any): Response {
    return this.error(res, `${resource} not found`, 404, errors);
  }

  static conflict(
    res: Response,
    message: string = 'Resource already exists',
    errors?: any
  ): Response {
    return this.error(res, message, 409, errors);
  }

  static tooManyRequests(
    res: Response,
    message: string = 'Too many requests',
    retryAfter?: number
  ): Response {
    if (retryAfter) {
      res.setHeader('Retry-After', retryAfter);
    }
    return this.error(res, message, 429);
  }

  static serverError(
    res: Response,
    message: string = 'Internal server error',
    error?: Error
  ): Response {
    // Log server errors with full details
    logger.error('Server Error', {
      error: error?.message,
      stack: error?.stack,
      path: res.req?.path,
      method: res.req?.method,
    });

    return this.error(res, message, 500);
  }

  static serviceUnavailable(
    res: Response,
    message: string = 'Service temporarily unavailable'
  ): Response {
    return this.error(res, message, 503);
  }

  /**
   * Validation error response (helper for express-validator)
   */
  static validationError(
    res: Response,
    errors: Array<{ param: string; msg: string; value?: any }>
  ): Response {
    const formattedErrors = errors.map((err) => ({
      field: err.param,
      message: err.msg,
      value: err.value,
      code: 'VALIDATION_ERROR',
    }));

    return this.error(res, 'Validation failed', 400, formattedErrors);
  }
}
