import { Router } from 'express';
import * as AppointmentController from '@/controllers/AppointmentController';
import { ValidationUtil } from '@/utils';
import { authenticate, authorize, ownerOrRoles } from '@/middleware/auth';
import { UserRole } from '@/types';

const router = Router();

// All appointment routes require authentication
router.use(authenticate);

// Public appointment routes (for all authenticated users)
router.get('/availability', AppointmentController.checkDoctorAvailability);

// Appointment CRUD operations
router.post('/', 
  ValidationUtil.validateAppointmentCreation(), 
  AppointmentController.createAppointment
);

// Appointment requests endpoint (for pending/requested appointments)
router.get('/requests', 
  authorize(UserRole.DOCTOR, UserRole.ADMIN), 
  AppointmentController.getAppointmentRequests
);

// Handle root path for appointment-requests route alias
router.get('/', (req, res, next) => {
  // If this is accessed via /appointment-requests, treat it as requests
  if (req.baseUrl.includes('appointment-requests')) {
    return AppointmentController.getAppointmentRequests(req, res, next);
  }
  // Otherwise, use the normal getAppointments
  return AppointmentController.getAppointments(req, res, next);
});

router.get('/stats', 
  authorize(UserRole.DOCTOR, UserRole.ADMIN), 
  AppointmentController.getAppointmentStats
);

router.get('/user/:userId', AppointmentController.getUserAppointments);

router.get('/:id', AppointmentController.getAppointmentById);

router.put('/:id', 
  ValidationUtil.validateAppointmentUpdate(), 
  AppointmentController.updateAppointment
);

// Appointment status management
router.patch('/:id/status', AppointmentController.updateAppointmentStatus);

// Appointment actions
router.post('/:id/cancel', 
  ValidationUtil.validateAppointmentCancellation(), 
  AppointmentController.cancelAppointment
);

router.post('/:id/reschedule', 
  ValidationUtil.validateAppointmentReschedule(), 
  AppointmentController.rescheduleAppointment
);

router.post('/:id/complete', 
  authorize(UserRole.DOCTOR, UserRole.ADMIN),
  ValidationUtil.validateAppointmentCompletion(), 
  AppointmentController.completeAppointment
);

export default router;