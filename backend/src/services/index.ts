export { UserService } from './UserService';
export type { CreateUserData, UpdateUserData, UserQuery } from './UserService';

export { AuthService } from './AuthService';
export type { RegisterData, LoginData, AuthResponse, RefreshTokenData } from './AuthService';

export { AppointmentService } from './AppointmentService';
export type { 
  CreateAppointmentData, 
  UpdateAppointmentData, 
  AppointmentQuery, 
  CancelAppointmentData, 
  RescheduleAppointmentData 
} from './AppointmentService';

export { DoctorService } from './DoctorService';
export type {
  DoctorPatientQuery,
  CreatePatientData,
  UpdatePatientData
} from './DoctorService';

// Additional service exports (if they exist)
// export { NotificationService } from './NotificationService';
// export { EmailService } from './EmailService';
// export { SMSService } from './SMSService';
// export { FileUploadService } from './FileUploadService';