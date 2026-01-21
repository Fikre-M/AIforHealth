import { Router } from 'express';
import * as healthController from '../controllers/healthController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@/types';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Health management endpoints (medications, reminders, metrics)
 */

// Medication endpoints
router.get('/medications', healthController.getMedications);
router.post('/medications', authorize(UserRole.DOCTOR, UserRole.ADMIN), healthController.createMedication);
router.get('/medications/:id', healthController.getMedicationById);
router.put('/medications/:id', authorize(UserRole.DOCTOR, UserRole.ADMIN), healthController.updateMedication);
router.delete('/medications/:id', authorize(UserRole.DOCTOR, UserRole.ADMIN), healthController.deleteMedication);

// Health reminder endpoints
router.get('/reminders', healthController.getHealthReminders);
router.post('/reminders', healthController.createHealthReminder);
router.get('/reminders/:id', healthController.getHealthReminderById);
router.put('/reminders/:id', healthController.updateHealthReminder);
router.patch('/reminders/:id/complete', healthController.markReminderComplete);
router.delete('/reminders/:id', healthController.deleteHealthReminder);

// Health metrics endpoints
router.get('/metrics', healthController.getHealthMetrics);
router.post('/metrics', healthController.createHealthMetric);
router.get('/metrics/:id', healthController.getHealthMetricById);
router.put('/metrics/:id', healthController.updateHealthMetric);
router.delete('/metrics/:id', healthController.deleteHealthMetric);

export default router;