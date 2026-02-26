// User Service exports
export { UserService } from './UserService';
export type { CreateUserData, UpdateUserData, UserQuery } from './UserService';

// Auth Service exports
export { AuthService } from './AuthService';
export type { RegisterData, LoginData, AuthResponse, RefreshTokenData } from './AuthService';

// Appointment Service exports
export { AppointmentService } from './AppointmentService';
export type { PaginatedResult } from './AppointmentService';
// Note: Other appointment types are commented out in the service file

// Doctor Service exports
export { DoctorService } from './DoctorService';
export type {
  DoctorPatientQuery,
  CreatePatientData,
  UpdatePatientData
} from './DoctorService';

// Notification Service exports (default export)
export { default as NotificationService } from './NotificationService';

// Email Service exports
export { EmailService } from './EmailService';

// SMS Service exports
export { SMSService } from './SMSService';

// Token Service exports
export { TokenService } from './TokenService';

// AI Assistant Service exports
export { default as AIAssistantService } from './AIAssistantService';