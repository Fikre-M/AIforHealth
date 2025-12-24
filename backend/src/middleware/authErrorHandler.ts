import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '@/utils/response';

/**
 * Authentication-specific error handler
 * This middleware should be placed after auth routes to catch auth-specific errors
 */
export const authErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // If response already sent, delegate to default error handler
  if (res.headersSent) {
    return next(error);
  }

  // Handle JWT-specific errors
  if (error.name === 'JsonWebTokenError') {
    ResponseUtil.error(res, 'Invalid token', 401, {
      code: 'INVALID_TOKEN',
      details: 'The provided JWT token is invalid or malformed'
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    ResponseUtil.error(res, 'Token expired', 401, {
      code: 'TOKEN_EXPIRED',
      details: 'The JWT token has expired. Please refresh your token or login again.'
    });
    return;
  }

  if (error.name === 'NotBeforeError') {
    ResponseUtil.error(res, 'Token not active', 401, {
      code: 'TOKEN_NOT_ACTIVE',
      details: 'The JWT token is not active yet'
    });
    return;
  }

  // Handle authentication-related errors
  if (error.message?.includes('Authentication')) {
    ResponseUtil.error(res, 'Authentication failed', 401, {
      code: 'AUTH_FAILED',
      details: error.message
    });
    return;
  }

  // Handle authorization-related errors
  if (error.message?.includes('Authorization') || error.message?.includes('permission')) {
    ResponseUtil.error(res, 'Access denied', 403, {
      code: 'ACCESS_DENIED',
      details: error.message
    });
    return;
  }

  // Handle user-related errors
  if (error.message?.includes('User not found')) {
    ResponseUtil.error(res, 'User not found', 404, {
      code: 'USER_NOT_FOUND',
      details: 'The requested user does not exist'
    });
    return;
  }

  if (error.message?.includes('Account locked')) {
    ResponseUtil.error(res, 'Account locked', 423, {
      code: 'ACCOUNT_LOCKED',
      details: 'Your account is temporarily locked. Please try again later or contact support.'
    });
    return;
  }

  if (error.message?.includes('Account deactivated')) {
    ResponseUtil.error(res, 'Account deactivated', 403, {
      code: 'ACCOUNT_DEACTIVATED',
      details: 'Your account has been deactivated. Please contact support.'
    });
    return;
  }

  // Handle password-related errors
  if (error.message?.includes('password')) {
    ResponseUtil.error(res, 'Password error', 400, {
      code: 'PASSWORD_ERROR',
      details: error.message
    });
    return;
  }

  // Handle email verification errors
  if (error.message?.includes('email') && error.message?.includes('verif')) {
    ResponseUtil.error(res, 'Email verification required', 403, {
      code: 'EMAIL_NOT_VERIFIED',
      details: 'Please verify your email address to continue'
    });
    return;
  }

  // If it's not an auth-related error, pass to next error handler
  next(error);
};

export default authErrorHandler;