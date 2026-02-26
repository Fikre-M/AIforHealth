import { Router } from 'express';
import { AppointmentController } from '@/controllers/AppointmentController';
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
  AppointmentController.create
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
    return AppointmentController.getAppointmentRequests(req, res);
  }
  // Otherwise, use the normal getAppointments
  return AppointmentController.getAppointments(req, res);
});

router.get('/stats', 
  authorize(UserRole.DOCTOR, UserRole.ADMIN), 
  AppointmentController.getStatistics
);

router.get('/user/:userId', AppointmentController.getUserAppointments);

router.get('/:id', AppointmentController.getById);

router.put('/:id', 
  ValidationUtil.validateAppointmentUpdate(), 
  AppointmentController.update
);

// Appointment status management
router.patch('/:id/status', AppointmentController.updateAppointmentStatus);

// Appointment actions
router.post('/:id/cancel', 
  ValidationUtil.validateAppointmentCancellation(), 
  AppointmentController.cancel
);

router.post('/:id/reschedule', 
  ValidationUtil.validateAppointmentReschedule(), 
  AppointmentController.reschedule
);

router.post('/:id/complete', 
  authorize(UserRole.DOCTOR, UserRole.ADMIN),
  ValidationUtil.validateAppointmentCompletion(), 
  AppointmentController.complete
);

export default router;