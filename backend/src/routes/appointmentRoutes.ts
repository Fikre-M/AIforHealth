import { Router } from 'express';
import * as appointmentController from '../controllers/appointmentController';
import { authenticate, authorize, authorizeAny, ownerOrRoles } from '../middleware/auth';
import { UserRole } from '@/types';
import { 
  validateAppointmentCreation, 
  validateAppointmentUpdate,
  validateAppointmentCancellation,
  validateAppointmentReschedule,
  validateAppointmentCompletion
} from '../middleware/validation';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Appointment management endpoints
 */

// Public appointment endpoints (for all authenticated users)
router.get('/', appointmentController.getAppointments);
router.get('/stats', authorize(UserRole.DOCTOR, UserRole.ADMIN), appointmentController.getAppointmentStats);
router.get('/availability', appointmentController.checkDoctorAvailability);

// Specific appointment operations
router.get('/:id', appointmentController.getAppointmentById);
router.put('/:id', validateAppointmentUpdate, appointmentController.updateAppointment);
router.patch('/:id/status', appointmentController.updateAppointmentStatus);
router.post('/:id/cancel', validateAppointmentCancellation, appointmentController.cancelAppointment);
router.post('/:id/reschedule', validateAppointmentReschedule, appointmentController.rescheduleAppointment);
router.post('/:id/complete', validateAppointmentCompletion, authorize(UserRole.DOCTOR), appointmentController.completeAppointment);

// User-specific appointment endpoints
router.get('/user/:userId', ownerOrRoles(UserRole.DOCTOR, UserRole.ADMIN), appointmentController.getUserAppointments);

// Create new appointment (patients can book, doctors/admins can create)
router.post('/', validateAppointmentCreation, authorizeAny(UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN), appointmentController.createAppointment);

export default router;