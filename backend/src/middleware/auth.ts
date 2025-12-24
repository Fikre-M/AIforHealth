import { Request, Response, NextFunction } from 'express';
import { JwtUtil } from '@/utils/jwt';
import { UserService } from '@/services';
import { UserRole } from '@/types';
import { ResponseUtil } from '@/utils/response';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: UserRole;
        iat?: number;
        exp?: number;
      };
    }
  }
}

/**
 * Authentication middleware to verify JWT tokens
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Extract token from Authorization header
    const token = JwtUtil.extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      ResponseUtil.error(res, 'Access token is required', 401, {
        code: 'TOKEN_MISSING',
        details: 'Please provide a valid Bearer token in the Authorization header'
      });
      return;
    }

    // Verify token
    const payload = JwtUtil.verifyAccessToken(token);

    // Check if user still exists and is active
    const user = await UserService.findUserById(payload.userId);
    if (!user) {
      ResponseUtil.error(res, 'User not found', 401, {
        code: 'USER_NOT_FOUND',
        details: 'The user associated with this token no longer exists'
      });
      return;
    }

    if (!user.isActive) {
      ResponseUtil.error(res, 'Account deactivated', 401, {
        code: 'ACCOUNT_DEACTIVATED',
        details: 'Your account has been deactivated. Please contact support.'
      });
      return;
    }

    // Check if account is locked
    if (user.isLocked()) {
      ResponseUtil.error(res, 'Account locked', 401, {
        code: 'ACCOUNT_LOCKED',
        details: 'Your account is temporarily locked due to too many failed login attempts'
      });
      return;
    }

    // Add user info to request
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      iat: payload.iat,
      exp: payload.exp,
    };

    next();
  } catch (error) {
    if (error instanceof Error) {
      // Handle specific JWT errors
      if (error.message.includes('expired')) {
        ResponseUtil.error(res, 'Token expired', 401, {
          code: 'TOKEN_EXPIRED',
          details: 'Your access token has expired. Please refresh your token or login again.'
        });
      } else if (error.message.includes('invalid')) {
        ResponseUtil.error(res, 'Invalid token', 401, {
          code: 'TOKEN_INVALID',
          details: 'The provided token is invalid or malformed'
        });
      } else {
        ResponseUtil.error(res, 'Authentication failed', 401, {
          code: 'AUTH_FAILED',
          details: error.message
        });
      }
    } else {
      ResponseUtil.error(res, 'Authentication failed', 401, {
        code: 'AUTH_FAILED',
        details: 'An unknown authentication error occurred'
      });
    }
  }
};

/**
 * Authorization middleware to check user roles
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ResponseUtil.error(res, 'Authentication required', 401, {
        code: 'AUTH_REQUIRED',
        details: 'You must be authenticated to access this resource'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      ResponseUtil.error(res, 'Insufficient permissions', 403, {
        code: 'INSUFFICIENT_PERMISSIONS',
        details: `This resource requires one of the following roles: ${roles.join(', ')}. Your role: ${req.user.role}`
      });
      return;
    }

    next();
  };
};

/**
 * Multiple role authorization (user must have at least one of the specified roles)
 */
export const authorizeAny = (...roles: UserRole[]) => {
  return authorize(...roles);
};

/**
 * Multiple role authorization (user must have all specified roles - for future use)
 */
export const authorizeAll = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ResponseUtil.error(res, 'Authentication required', 401, {
        code: 'AUTH_REQUIRED',
        details: 'You must be authenticated to access this resource'
      });
      return;
    }

    // For now, since users have single roles, this checks if user has the exact role
    // In future, if users can have multiple roles, this would check all roles
    const hasAllRoles = roles.every(role => req.user!.role === role);
    
    if (!hasAllRoles) {
      ResponseUtil.error(res, 'Insufficient permissions', 403, {
        code: 'INSUFFICIENT_PERMISSIONS',
        details: `This resource requires all of the following roles: ${roles.join(', ')}. Your role: ${req.user.role}`
      });
      return;
    }

    next();
  };
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = JwtUtil.extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const payload = JwtUtil.verifyAccessToken(token);
      const user = await UserService.findUserById(payload.userId);
      
      if (user && user.isActive && !user.isLocked()) {
        req.user = {
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
          iat: payload.iat,
          exp: payload.exp,
        };
      }
    }

    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

/**
 * Middleware to check if user owns the resource or is admin
 */
export const ownerOrAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    ResponseUtil.error(res, 'Authentication required', 401, {
      code: 'AUTH_REQUIRED',
      details: 'You must be authenticated to access this resource'
    });
    return;
  }

  const resourceUserId = req.params.id || req.params.userId;
  const isOwner = req.user.userId === resourceUserId;
  const isAdmin = req.user.role === UserRole.ADMIN;

  if (!isOwner && !isAdmin) {
    ResponseUtil.error(res, 'Access denied', 403, {
      code: 'ACCESS_DENIED',
      details: 'You can only access your own resources unless you are an administrator'
    });
    return;
  }

  next();
};

/**
 * Middleware to check if user owns the resource or has specific roles
 */
export const ownerOrRoles = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ResponseUtil.error(res, 'Authentication required', 401, {
        code: 'AUTH_REQUIRED',
        details: 'You must be authenticated to access this resource'
      });
      return;
    }

    const resourceUserId = req.params.id || req.params.userId;
    const isOwner = req.user.userId === resourceUserId;
    const hasRole = roles.includes(req.user.role);

    if (!isOwner && !hasRole) {
      ResponseUtil.error(res, 'Access denied', 403, {
        code: 'ACCESS_DENIED',
        details: `You can only access your own resources unless you have one of these roles: ${roles.join(', ')}`
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user is verified (email verified)
 */
export const requireVerified = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    ResponseUtil.error(res, 'Authentication required', 401, {
      code: 'AUTH_REQUIRED',
      details: 'You must be authenticated to access this resource'
    });
    return;
  }

  try {
    const user = await UserService.findUserById(req.user.userId);
    if (!user || !user.isEmailVerified) {
      ResponseUtil.error(res, 'Email verification required', 403, {
        code: 'EMAIL_NOT_VERIFIED',
        details: 'You must verify your email address to access this resource'
      });
      return;
    }

    next();
  } catch (error) {
    ResponseUtil.error(res, 'Verification check failed', 500, {
      code: 'VERIFICATION_CHECK_FAILED',
      details: 'Unable to verify user status'
    });
  }
};

/**
 * Rate limiting middleware for sensitive operations
 */
export const sensitiveOperation = (req: Request, res: Response, next: NextFunction): void => {
  // Add additional security headers for sensitive operations
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  next();
};