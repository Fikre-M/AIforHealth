import { Router } from 'express';
import * as notificationController from '../controllers/notificationController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@/types';

const router = Router();

// Protected routes (require authentication)
router.use(authenticate);

// User notification endpoints
router.get('/', notificationController.getNotifications);
router.put('/:id/read', notificationController.markAsRead);
router.put('/mark-all-read', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);

// Admin/Internal endpoints (require admin role)
router.use(authorize(UserRole.ADMIN));
router.post('/process-pending', notificationController.processPendingNotifications);
router.post('/check-upcoming-appointments', notificationController.checkUpcomingAppointments);
router.post('/check-missed-appointments', notificationController.checkMissedAppointments);

export default router;
