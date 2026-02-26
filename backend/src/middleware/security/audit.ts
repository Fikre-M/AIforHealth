import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

interface AuditLog {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ip: string;
  userAgent?: string;
  changes?: any;
  status: 'success' | 'failure';
  timestamp: Date;
}

// Audit logging middleware
export const auditLog = (action: string, resource: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;
    const originalSend = res.send;

    let responseBody: any;

    // Override res.json to capture response
    res.json = function (body) {
      responseBody = body;
      return originalJson.call(this, body);
    };

    // Override res.send to capture response
    res.send = function (body) {
      responseBody = body;
      return originalSend.call(this, body);
    };

    // Wait for response to finish
    res.once('finish', async () => {
      const auditLogEntry: AuditLog = {
        userId: req.user?.userId,
        action,
        resource,
        resourceId: req.params.id || req.body.id,
        ip: req.ip || req.socket.remoteAddress || 'unknown',
        userAgent: req.get('user-agent'),
        changes: {
          body: req.body,
          query: req.query,
          params: req.params,
        },
        status: res.statusCode < 400 ? 'success' : 'failure',
        timestamp: new Date(),
      };

      // Store audit log
      await storeAuditLog(auditLogEntry);

      // Log sensitive actions
      if (isSensitiveAction(action)) {
        logger.info('Sensitive action performed', auditLogEntry);
      }
    });

    next();
  };
};

// Store audit log
const storeAuditLog = async (log: AuditLog) => {
  // Store in database
  // await AuditLogModel.create(log);
  // Store in Elasticsearch for search
  // await elasticsearchClient.index({
  //   index: 'audit-logs',
  //   body: log
  // });
  // If using AWS CloudWatch
  // cloudWatch.logs.putLogEvents(...);
};

// Check if action is sensitive
const isSensitiveAction = (action: string): boolean => {
  const sensitiveActions = [
    'DELETE',
    'UPDATE',
    'CREATE',
    'LOGIN',
    'LOGOUT',
    'PASSWORD_CHANGE',
    'PASSWORD_RESET',
    'ROLE_CHANGE',
    'PERMISSION_CHANGE',
    'DATA_EXPORT',
    'DATA_IMPORT',
  ];

  return sensitiveActions.includes(action.toUpperCase());
};

// Specific audit loggers
export const auditLoggers = {
  auth: {
    login: auditLog('LOGIN', 'auth'),
    logout: auditLog('LOGOUT', 'auth'),
    passwordChange: auditLog('PASSWORD_CHANGE', 'user'),
    passwordReset: auditLog('PASSWORD_RESET', 'user'),
  },

  crud: {
    create: (resource: string) => auditLog('CREATE', resource),
    read: (resource: string) => auditLog('READ', resource),
    update: (resource: string) => auditLog('UPDATE', resource),
    delete: (resource: string) => auditLog('DELETE', resource),
  },

  data: {
    export: auditLog('DATA_EXPORT', 'data'),
    import: auditLog('DATA_IMPORT', 'data'),
  },
};

// Compliance report generator
export const generateComplianceReport = async (startDate: Date, endDate: Date) => {
  // Fetch audit logs from database
  // const logs = await AuditLogModel.find({
  //   timestamp: { $gte: startDate, $lte: endDate }
  // });
  // Generate report
  // return {
  //   period: { startDate, endDate },
  //   totalEvents: logs.length,
  //   byAction: groupBy(logs, 'action'),
  //   byUser: groupBy(logs, 'userId'),
  //   suspiciousActivities: logs.filter(l => isSuspicious(l))
  // };
};
