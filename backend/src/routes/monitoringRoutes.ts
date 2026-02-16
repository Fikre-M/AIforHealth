import { Router } from 'express';
import * as monitoringController from '../controllers/monitoringController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

// Public health check endpoint
router.get('/health', monitoringController.getHealthStatus);

// Protected monitoring endpoints (admin only)
router.get('/metrics', authenticate, authorize(UserRole.ADMIN), monitoringController.getMetrics);
router.get('/logs', authenticate, authorize(UserRole.ADMIN), monitoringController.getLogs);
router.get('/database/stats', authenticate, authorize(UserRole.ADMIN), monitoringController.getDatabaseStats);
router.post('/errors/reset', authenticate, authorize(UserRole.ADMIN), monitoringController.resetErrorMetrics);

// Development/testing endpoints
router.post('/test-error', authenticate, authorize(UserRole.ADMIN), monitoringController.testError);

export default router;
