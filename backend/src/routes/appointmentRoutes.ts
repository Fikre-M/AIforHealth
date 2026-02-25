import { Router } from 'express';
import { ValidationUtil } from '@/utils/validation';
import { AppointmentController } from '@/controllers/AppointmentController';
import { authenticate, authorize } from '@/middleware/auth';
import { UserRole } from '@/types';

const router = Router();

// All appointment routes require authentication
router.use(authenticate);

// ✅ CREATE Appointment
router.post(
  '/',
  ValidationUtil.validateAppointmentCreation(),
  AppointmentController.create
);

// ✅ GET Appointments (with filtering and pagination)
router.get('/', AppointmentController.getAppointments);

// ✅ GET Appointment by ID
router.get('/:id', AppointmentController.getById);

// ✅ UPDATE Appointment
router.put(
  '/:id',
  ValidationUtil.validateAppointmentUpdate(),
  AppointmentController.update
);

// ✅ RESCHEDULE Appointment
router.post(
  '/:id/reschedule',
  ValidationUtil.validateAppointmentReschedule(),
  AppointmentController.reschedule
);

// ✅ CANCEL Appointment
router.post(
  '/:id/cancel',
  ValidationUtil.validateAppointmentCancellation(),
  AppointmentController.cancel
);

// ✅ COMPLETE Appointment (doctors only)
router.post(
  '/:id/complete',
  authorize(UserRole.DOCTOR, UserRole.ADMIN),
  ValidationUtil.validateAppointmentCompletion(),
  AppointmentController.complete
);

// ✅ GET Statistics (doctors and admins only)
router.get(
  '/stats',
  authorize(UserRole.DOCTOR, UserRole.ADMIN),
  AppointmentController.getStatistics
);

// ✅ BULK Update (admins only)
router.post(
  '/bulk',
  authorize(UserRole.ADMIN),
  AppointmentController.bulkUpdate
);

export default router;

// import { Router } from 'express';
// import * as appointmentController from '../controllers/appointmentController';
// import { authenticate, authorize, authorizeAny, ownerOrRoles } from '../middleware/auth';
// import { UserRole } from '@/types';
// import {
//   validateAppointmentCreation,
//   validateAppointmentUpdate,
//   validateAppointmentCancellation,
//   validateAppointmentReschedule,
//   validateAppointmentCompletion
// } from '../middleware/validation';

// const router = Router();

// // Apply authentication to all routes
// router.use(authenticate);

// /**
//  * @swagger
//  * tags:
//  *   name: Appointments
//  *   description: Appointment management endpoints
//  */

// // Public appointment endpoints (for all authenticated users)
// router.get('/', appointmentController.getAppointments);
// router.get('/stats', authorize(UserRole.DOCTOR, UserRole.ADMIN), appointmentController.getAppointmentStats);
// router.get('/availability', appointmentController.checkDoctorAvailability);

// // Specific appointment operations
// router.get('/:id', appointmentController.getAppointmentById);
// router.put('/:id', validateAppointmentUpdate, appointmentController.updateAppointment);
// router.patch('/:id/status', appointmentController.updateAppointmentStatus);
// router.post('/:id/cancel', validateAppointmentCancellation, appointmentController.cancelAppointment);
// router.post('/:id/reschedule', validateAppointmentReschedule, appointmentController.rescheduleAppointment);
// router.post('/:id/complete', validateAppointmentCompletion, authorize(UserRole.DOCTOR), appointmentController.completeAppointment);

// // User-specific appointment endpoints
// router.get('/user/:userId', ownerOrRoles(UserRole.DOCTOR, UserRole.ADMIN), appointmentController.getUserAppointments);

// // Create new appointment (patients can book, doctors/admins can create)
// router.post('/', validateAppointmentCreation, authorizeAny(UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN), appointmentController.createAppointment);

// export default router;
