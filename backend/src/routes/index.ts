import { Router } from 'express';
import { ResponseUtil } from '@/utils/response';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  ResponseUtil.success(res, {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  }, 'Service is healthy');
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