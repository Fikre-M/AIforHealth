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

// Future service exports will be added here:
// export { DoctorService } from './DoctorService';