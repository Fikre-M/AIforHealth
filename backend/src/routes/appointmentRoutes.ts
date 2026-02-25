import { Router } from 'express';
import { appointmentValidators } from '@/middleware/validators/appointment.validators';
import { AppointmentController } from '@/controllers/appointment.controller';
import { authenticate } from '@/middleware/auth';
import { authorize } from '@/middleware/authorize';

const router = Router();

// ✅ CREATE Appointment - Validators are USED here
router.post(
  '/',
  authenticate,
  authorize(['patient', 'doctor']),
  appointmentValidators.create, // <-- THIS is where validators are RENDERED/USED
  AppointmentController.create
);

// ✅ UPDATE Appointment
router.put(
  '/:id',
  authenticate,
  appointmentValidators.update, // <-- Validators in action
  AppointmentController.update
);

// ✅ RESCHEDULE Appointment
router.post(
  '/:id/reschedule',
  authenticate,
  appointmentValidators.reschedule, // <-- Validators in action
  AppointmentController.reschedule
);

// ✅ CANCEL Appointment
router.post(
  '/:id/cancel',
  authenticate,
  appointmentValidators.cancel, // <-- Validators in action
  AppointmentController.cancel
);

// ✅ GET by Date Range with Pagination
router.get(
  '/range',
  authenticate,
  appointmentValidators.getByDateRange, // <-- Validators validate query params
  AppointmentController.getByDateRange
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
