import { Request, Response, NextFunction } from 'express';
import { JwtUtil } from '@/utils/jwt';
import { UserService } from '@/services';
import { UserRole } from '@/types';
import { ResponseUtil } from '@/utils/response';
import { AuthenticatedRequest } from '@/types/express';

/**
 * Require authentication (alias for authenticate)
 */
export const requireAuth = authenticate;

/**
 * Authentication middleware
 */
export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = JwtUtil.extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      ResponseUtil.error(res, 'Access token is required', 401, {
        code: 'TOKEN_MISSING',
      });
      return;
    }

    const payload = JwtUtil.verifyAccessToken(token);

    const user = await UserService.findUserById(payload.userId);

    if (!user || !user.isActive || user.isLocked()) {
      ResponseUtil.error(res, 'Authentication failed', 401, {
        code: 'AUTH_FAILED',
      });
      return;
    }

    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      iat: payload.iat,
      exp: payload.exp,
    };

    next();
  } catch (error) {
    ResponseUtil.error(res, 'Authentication failed', 401, {
      code: 'AUTH_FAILED',
    });
  }
}

/**
 * Role-based authorization
 */
export function authorize(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ResponseUtil.error(res, 'Authentication required', 401, {
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      ResponseUtil.error(res, 'Insufficient permissions', 403, {
        code: 'INSUFFICIENT_PERMISSIONS',
      });
      return;
    }

    next();
  };
}

/**
 * Require any role (alias)
 */
export const authorizeAny = authorize;

/**
 * Require all roles (future-safe)
 */
export function authorizeAll(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ResponseUtil.error(res, 'Authentication required', 401, {
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    const hasAllRoles = roles.every((role) => role === req.user?.role);

    if (!hasAllRoles) {
      ResponseUtil.error(res, 'Insufficient permissions', 403, {
        code: 'INSUFFICIENT_PERMISSIONS',
      });
      return;
    }

    next();
  };
}

/**
 * Optional authentication
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = JwtUtil.extractTokenFromHeader(req.headers.authorization);

    if (!token) return next();

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

    next();
  } catch {
    next();
  }
}

/**
 * Owner or Admin
 */
export function ownerOrAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    ResponseUtil.error(res, 'Authentication required', 401, {
      code: 'AUTH_REQUIRED',
    });
    return;
  }

  const resourceUserId = req.params?.id ?? req.params?.userId;

  if (!resourceUserId) {
    ResponseUtil.error(res, 'Resource not specified', 400, {
      code: 'RESOURCE_ID_MISSING',
    });
    return;
  }

  const isOwner = req.user.userId === resourceUserId;
  const isAdmin = req.user.role === UserRole.ADMIN;

  if (!isOwner && !isAdmin) {
    ResponseUtil.error(res, 'Access denied', 403, {
      code: 'ACCESS_DENIED',
    });
    return;
  }

  next();
}
