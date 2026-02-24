export { UserController } from './UserController';
export { AuthController } from './AuthController';
export { ProtectedController } from './ProtectedController';

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

// Appointment Controller exports (function-based)
export {
  createAppointment as createAppointmentController,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  rescheduleAppointment,
  completeAppointment,
  checkDoctorAvailability,
  getAppointmentStats,
  getUserAppointments
} from './AppointmentController';

// Future controller exports will be added here:
// export { NotificationController } from './NotificationController';
// export { AdminController } from './AdminController';