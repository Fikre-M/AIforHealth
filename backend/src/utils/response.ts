import { Response } from 'express';
import { ApiResponse, ApiSuccessResponse, ApiErrorResponse } from '@/types';

export class ResponseUtil {
  static success<T>(
    res: Response,
    data?: T,
    message?: string,
    statusCode = 200
  ): Response<ApiSuccessResponse<T>> {
    return res.status(statusCode).json({
      success: true,
      data,
      ...(message ? { message } : {}),
    });
  }

  static error(
    res: Response,
    message: string,
    statusCode = 400,
    details?: Record<string, unknown>
  ): Response<ApiErrorResponse> {
    return res.status(statusCode).json({
      success: false,
      error: message,
      ...(details ? { details } : {}),
      statusCode,
    });
  }

  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    statusCode = 200
  ): Response<ApiSuccessResponse<T[]>> {
    const totalPages = Math.ceil(total / limit);
    return res.status(statusCode).json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  }
}
