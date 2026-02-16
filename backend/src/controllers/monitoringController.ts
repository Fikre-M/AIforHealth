import { Request, Response } from 'express';
import asyncHandler from '../middleware/asyncHandler';
import { getErrorMonitoringHealth, ErrorMetrics } from '@/utils/errorMonitoring';
import { logger } from '@/utils/logger';
import os from 'os';
import mongoose from 'mongoose';

/**
 * @route   GET /api/monitoring/health
 * @desc    Get application health status
 * @access  Public
 */
export const getHealthStatus = asyncHandler(async (req: Request, res: Response) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: await getDatabaseHealth(),
      errorMonitoring: getErrorMonitoringHealth(),
    },
    system: getSystemHealth(),
  };

  const statusCode = health.services.database.connected ? 200 : 503;

  res.status(statusCode).json({
    success: true,
    data: health,
  });
});

/**
 * @route   GET /api/monitoring/metrics
 * @desc    Get application metrics
 * @access  Private/Admin
 */
export const getMetrics = asyncHandler(async (req: Request, res: Response) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    process: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      pid: process.pid,
    },
    system: {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      loadAverage: os.loadavg(),
    },
    database: await getDatabaseMetrics(),
    errors: ErrorMetrics.getMetrics(),
    mostCommonErrors: ErrorMetrics.getMostCommonErrors(10),
  };

  res.status(200).json({
    success: true,
    data: metrics,
  });
});

/**
 * @route   GET /api/monitoring/logs
 * @desc    Get recent logs (last N entries)
 * @access  Private/Admin
 */
export const getLogs = asyncHandler(async (req: Request, res: Response) => {
  const { level = 'all', limit = '100' } = req.query;
  
  // In production, you'd read from log files or log aggregation service
  // For now, return a message
  res.status(200).json({
    success: true,
    message: 'Log retrieval not implemented. Use log aggregation service (e.g., ELK, Datadog)',
    data: {
      level,
      limit: parseInt(limit as string),
      suggestion: 'Configure log aggregation service for production use',
    },
  });
});

/**
 * @route   POST /api/monitoring/errors/reset
 * @desc    Reset error metrics
 * @access  Private/Admin
 */
export const resetErrorMetrics = asyncHandler(async (req: Request, res: Response) => {
  ErrorMetrics.reset();
  
  logger.info('Error metrics reset', {
    userId: req.user?.userId,
    timestamp: new Date().toISOString(),
  });

  res.status(200).json({
    success: true,
    message: 'Error metrics reset successfully',
  });
});

/**
 * @route   GET /api/monitoring/database/stats
 * @desc    Get database statistics
 * @access  Private/Admin
 */
export const getDatabaseStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await getDatabaseMetrics();

  res.status(200).json({
    success: true,
    data: stats,
  });
});

/**
 * Helper: Get database health
 */
async function getDatabaseHealth() {
  try {
    const state = mongoose.connection.readyState;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];

    return {
      connected: state === 1,
      state: states[state] || 'unknown',
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    };
  } catch (error) {
    return {
      connected: false,
      state: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Helper: Get database metrics
 */
async function getDatabaseMetrics() {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      return { available: false, message: 'Database not connected' };
    }

    const admin = db.admin();
    const serverStatus = await admin.serverStatus();
    const dbStats = await db.stats();

    return {
      available: true,
      connections: {
        current: serverStatus.connections.current,
        available: serverStatus.connections.available,
        totalCreated: serverStatus.connections.totalCreated,
      },
      storage: {
        dataSize: dbStats.dataSize,
        storageSize: dbStats.storageSize,
        indexSize: dbStats.indexSize,
        collections: dbStats.collections,
        indexes: dbStats.indexes,
        objects: dbStats.objects,
      },
      operations: {
        insert: serverStatus.opcounters.insert,
        query: serverStatus.opcounters.query,
        update: serverStatus.opcounters.update,
        delete: serverStatus.opcounters.delete,
        getmore: serverStatus.opcounters.getmore,
        command: serverStatus.opcounters.command,
      },
      memory: {
        resident: serverStatus.mem.resident,
        virtual: serverStatus.mem.virtual,
      },
    };
  } catch (error) {
    logger.error('Failed to get database metrics', error);
    return {
      available: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Helper: Get system health
 */
function getSystemHealth() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memoryUsagePercent = (usedMem / totalMem) * 100;

  return {
    platform: os.platform(),
    arch: os.arch(),
    nodeVersion: process.version,
    cpus: os.cpus().length,
    memory: {
      total: totalMem,
      free: freeMem,
      used: usedMem,
      usagePercent: memoryUsagePercent.toFixed(2),
    },
    loadAverage: os.loadavg(),
    uptime: os.uptime(),
  };
}

/**
 * @route   POST /api/monitoring/test-error
 * @desc    Test error handling and monitoring (development only)
 * @access  Private/Admin
 */
export const testError = asyncHandler(async (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    res.status(403).json({
      success: false,
      message: 'Error testing is disabled in production',
    });
    return;
  }

  const { type = 'generic' } = req.body;

  switch (type) {
    case 'validation':
      throw new Error('Test validation error');
    case 'database':
      throw new Error('Test database error');
    case 'unauthorized':
      const error: any = new Error('Test unauthorized error');
      error.statusCode = 401;
      throw error;
    case 'notfound':
      const notFoundError: any = new Error('Test not found error');
      notFoundError.statusCode = 404;
      throw notFoundError;
    default:
      throw new Error('Test generic error');
  }
});
