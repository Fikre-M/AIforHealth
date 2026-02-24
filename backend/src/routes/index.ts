import { Router } from 'express';
import { ResponseUtil } from '@/utils/response';
import { database, checkDatabaseHealth, getDatabaseStats } from '@/config/database';
import userRoutes from '@/features/users/routes';
import authRoutes from '@/features/auth/routes';
import protectedRoutes from '@/features/protected/routes';
import appointmentRoutes from '@/features/appointments/routes';

const router = Router();

// Feature routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/protected', protectedRoutes);

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const dbHealthy = await checkDatabaseHealth();
    const dbStats = getDatabaseStats();
    
    const healthData = {
      status: dbHealthy ? 'OK' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      database: {
        connected: database.getConnectionStatus(),
        state: database.getConnectionState(),
        healthy: dbHealthy,
        stats: dbStats,
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    };

    const statusCode = dbHealthy ? 200 : 503;
    ResponseUtil.success(res, healthData, 'Health check completed', statusCode);
  } catch (error) {
    ResponseUtil.error(res, 'Health check failed', 503, error);
  }
});

// API info endpoint
router.get('/', (req, res) => {
  ResponseUtil.success(res, {
    name: 'AIforHealth Backend API',
    version: '1.0.0',
    description: 'AI Healthcare & Medical Appointment System Backend',
    endpoints: {
      health: '/api/v1/health',
      // Future endpoints will be added here
    },
  });
});

export default router;