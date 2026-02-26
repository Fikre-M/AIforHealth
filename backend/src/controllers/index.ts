import { AppointmentController } from './AppointmentController';

export { UserController } from './UserController';
export { AuthController } from './AuthController';
export { ProtectedController } from './ProtectedController';
export { PatientController } from './patientController';

// Doctor Controller exports (function-based)
export { 
  getDailyAppointments,
  getUpcomingAppointments,
  getPatientList,
  getPatientSummaries,
  getPatient,
  createPatient,
  updatePatient,
  getDoctorStats
} from './doctorController';

// Appointment Controller exports (class-based)
export { AppointmentController } from './AppointmentController';

// Individual appointment controller methods for backward compatibility
export const createAppointmentController = AppointmentController.create;
export const getAppointments = AppointmentController.getAppointments;
export const getAppointmentById = AppointmentController.getById;
export const updateAppointment = AppointmentController.update;
export const updateAppointmentStatus = AppointmentController.updateAppointmentStatus;
export const cancelAppointment = AppointmentController.cancel;
export const rescheduleAppointment = AppointmentController.reschedule;
export const completeAppointment = AppointmentController.complete;
export const checkDoctorAvailability = AppointmentController.checkDoctorAvailability;
export const getAppointmentStats = AppointmentController.getStatistics;
export const getUserAppointments = AppointmentController.getUserAppointments;

// Future controller exports will be added here:
// export { NotificationController } from './NotificationController';
// export { AdminController } from './AdminController';