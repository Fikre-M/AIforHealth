import { Request, Response } from 'express';
import { ResponseUtil, asyncHandler } from '@/utils';
import { UserRole } from '@/types';

/**
 * Protected controller demonstrating various authentication and authorization patterns
 */
export class ProtectedController {
  /**
   * Public endpoint (no authentication required)
   */
  static publicEndpoint = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    ResponseUtil.success(res, {
      message: 'This is a public endpoint',
      timestamp: new Date().toISOString(),
      authenticated: !!req.user,
      user: req.user ? {
        userId: req.user.userId,
        email: req.user.email,
        role: req.user.role
      } : null
    }, 'Public endpoint accessed successfully');
  });

  /**
   * Protected endpoint (authentication required)
   */
  static protectedEndpoint = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    ResponseUtil.success(res, {
      message: 'This is a protected endpoint',
      timestamp: new Date().toISOString(),
      user: {
        userId: req.user!.userId,
        email: req.user!.email,
        role: req.user!.role,
        tokenIssuedAt: req.user!.iat ? new Date(req.user!.iat * 1000) : null,
        tokenExpiresAt: req.user!.exp ? new Date(req.user!.exp * 1000) : null
      }
    }, 'Protected endpoint accessed successfully');
  });

  /**
   * Admin only endpoint
   */
  static adminOnlyEndpoint = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    ResponseUtil.success(res, {
      message: 'This endpoint is only accessible by administrators',
      timestamp: new Date().toISOString(),
      admin: {
        userId: req.user!.userId,
        email: req.user!.email,
        role: req.user!.role
      },
      systemInfo: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version
      }
    }, 'Admin endpoint accessed successfully');
  });

  /**
   * Doctor only endpoint
   */
  static doctorOnlyEndpoint = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    ResponseUtil.success(res, {
      message: 'This endpoint is only accessible by doctors',
      timestamp: new Date().toISOString(),
      doctor: {
        userId: req.user!.userId,
        email: req.user!.email,
        role: req.user!.role
      },
      features: [
        'Patient management',
        'Appointment scheduling',
        'Medical records access',
        'Prescription management'
      ]
    }, 'Doctor endpoint accessed successfully');
  });

  /**
   * Patient only endpoint
   */
  static patientOnlyEndpoint = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    ResponseUtil.success(res, {
      message: 'This endpoint is only accessible by patients',
      timestamp: new Date().toISOString(),
      patient: {
        userId: req.user!.userId,
        email: req.user!.email,
        role: req.user!.role
      },
      features: [
        'View appointments',
        'Medical history',
        'Prescription tracking',
        'Health monitoring'
      ]
    }, 'Patient endpoint accessed successfully');
  });

  /**
   * Doctor or Admin endpoint (multiple roles)
   */
  static doctorOrAdminEndpoint = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    ResponseUtil.success(res, {
      message: 'This endpoint is accessible by doctors and administrators',
      timestamp: new Date().toISOString(),
      user: {
        userId: req.user!.userId,
        email: req.user!.email,
        role: req.user!.role
      },
      permissions: req.user!.role === UserRole.ADMIN ? 
        ['Full system access', 'User management', 'System configuration'] :
        ['Patient management', 'Medical records', 'Appointment management']
    }, 'Multi-role endpoint accessed successfully');
  });

  /**
   * Owner or Admin endpoint (resource-based access)
   */
  static ownerOrAdminEndpoint = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const resourceId = req.params.id;
    const isOwner = req.user!.userId === resourceId;
    const isAdmin = req.user!.role === UserRole.ADMIN;

    ResponseUtil.success(res, {
      message: 'This endpoint demonstrates owner or admin access',
      timestamp: new Date().toISOString(),
      resourceId,
      access: {
        isOwner,
        isAdmin,
        accessType: isAdmin ? 'admin' : 'owner'
      },
      user: {
        userId: req.user!.userId,
        email: req.user!.email,
        role: req.user!.role
      }
    }, 'Resource-based endpoint accessed successfully');
  });

  /**
   * Verified users only endpoint
   */
  static verifiedOnlyEndpoint = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    ResponseUtil.success(res, {
      message: 'This endpoint requires email verification',
      timestamp: new Date().toISOString(),
      user: {
        userId: req.user!.userId,
        email: req.user!.email,
        role: req.user!.role,
        verified: true
      },
      secureFeatures: [
        'Sensitive data access',
        'Financial transactions',
        'Account modifications',
        'Data export'
      ]
    }, 'Verified user endpoint accessed successfully');
  });

  /**
   * Sensitive operation endpoint (with additional security headers)
   */
  static sensitiveEndpoint = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    ResponseUtil.success(res, {
      message: 'This is a sensitive operation with enhanced security',
      timestamp: new Date().toISOString(),
      user: {
        userId: req.user!.userId,
        email: req.user!.email,
        role: req.user!.role
      },
      securityMeasures: [
        'No caching headers set',
        'Enhanced authentication required',
        'Audit logging enabled',
        'Rate limiting applied'
      ]
    }, 'Sensitive operation completed successfully');
  });

  /**
   * Optional auth endpoint (works with or without authentication)
   */
  static optionalAuthEndpoint = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const isAuthenticated = !!req.user;
    
    ResponseUtil.success(res, {
      message: 'This endpoint works with optional authentication',
      timestamp: new Date().toISOString(),
      authenticated: isAuthenticated,
      user: isAuthenticated ? {
        userId: req.user!.userId,
        email: req.user!.email,
        role: req.user!.role
      } : null,
      features: isAuthenticated ? 
        ['Personalized content', 'User preferences', 'History tracking'] :
        ['Basic content', 'Public information', 'General features']
    }, 'Optional auth endpoint accessed successfully');
  });
}