import { Request, Response, NextFunction } from 'express';
import AuditLog from '@/models/AuditLog';

/**
 * Audit logging middleware for tracking sensitive operations
 * Use this for HIPAA compliance and security monitoring
 */
export const auditLog = (action: string, options: { 
  includeBody?: boolean;
  resourceIdParam?: string;
} = {}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    // Capture original json method
    const originalJson = res.json.bind(res);
    
    // Override json method to log after response
    res.json = function(data: any) {
      const duration = Date.now() - startTime;
      
      // Sanitize request body (remove sensitive fields)
      const sanitizedBody = options.includeBody ? sanitizeBody(req.body) : undefined;
      
      // Get resource ID from params if specified
      const resourceId = options.resourceIdParam 
        ? req.params[options.resourceIdParam]
        : req.params.id;
      
      // Log the action (async, don't wait)
      AuditLog.logAction({
        userId: req.user?.userId,
        action,
        resource: req.originalUrl,
        resourceId,
        method: req.method as any,
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.get('user-agent'),
        requestBody: sanitizedBody,
        responseStatus: res.statusCode,
        success: res.statusCode < 400,
        metadata: {
          duration,
          userRole: req.user?.role,
        },
      }).catch(err => {
        console.error('Audit log failed:', err);
        // Don't throw - audit logging should never break the application
      });
      
      return originalJson(data);
    };
    
    next();
  };
};

/**
 * Sanitize request body by removing sensitive fields
 */
function sanitizeBody(body: any): any {
  if (!body || typeof body !== 'object') return body;
  
  const sensitiveFields = [
    'password',
    'currentPassword',
    'newPassword',
    'token',
    'refreshToken',
    'accessToken',
    'apiKey',
    'secret',
  ];
  
  const sanitized = { ...body };
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

/**
 * Audit middleware for patient data access (HIPAA compliance)
 */
export const auditPatientAccess = auditLog('VIEW_PATIENT_DATA', {
  resourceIdParam: 'patientId',
});

/**
 * Audit middleware for medical record access
 */
export const auditMedicalRecordAccess = auditLog('VIEW_MEDICAL_RECORD', {
  resourceIdParam: 'recordId',
});

/**
 * Audit middleware for admin actions
 */
export const auditAdminAction = (action: string) => auditLog(action, {
  includeBody: true,
});

/**
 * Log security events (failed logins, suspicious activity)
 */
export const logSecurityEvent = async (
  action: string,
  req: Request,
  details?: { errorMessage?: string; metadata?: any }
) => {
  try {
    await AuditLog.logAction({
      userId: req.user?.userId,
      action: action as any,
      resource: req.originalUrl,
      method: req.method as any,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.get('user-agent'),
      success: false,
      errorMessage: details?.errorMessage,
      metadata: details?.metadata,
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};
