import { Response } from 'express';
import { ApiResponse } from '@/types';

/**
 * Utility class for standardized API responses
 */
export class ResponseUtil {
  /**
   * Send success response
   */
  static success<T>(
    res: Response,
    data?: T,
    message?: string,
    statusCode: number = 200
  ): Response {
    const response: any = {
      success: true,
      data,
    };

    if (message) {
      response.message = message;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send error response
   */
  static error(
    res: Response,
    message: string,
    statusCode: number = 400,
    details?: any
  ): Response {
    const response: any = {
      success: false,
      error: {
        message,
        ...(details && { details }),
      },
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send paginated response
   */
  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    statusCode: number = 200
  ): Response {
    const pages = Math.ceil(total / limit);

    const response: any = {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    };

    return res.status(statusCode).json(response);
  }
}