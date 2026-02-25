import { Router } from 'express';
import { ResponseUtil } from '@/utils/apiResponse';

const router = Router();

// Simple health check
router.get('/health', (_req, res) => {
  ResponseUtil.success(res, {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  }, 'Health check successful');
});

// Simple test endpoint
router.get('/test', (_req, res) => {
  ResponseUtil.success(res, {
    message: 'Backend is working!',
    timestamp: new Date().toISOString()
  }, 'Test successful');
});

export default router;