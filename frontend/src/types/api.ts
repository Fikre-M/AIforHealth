/**
 * API Service Type Definitions
 * 
 * Type-safe API service layer definitions
 */

import type {
  User,
  Patient,
  Doctor,
  Appointment,
  Notification,
  ChatMessage,
  LoginCredentials,
  RegisterData,
  CreateAppointmentData,
  ApiResponse,
  PaginatedResponse,
} from './index';

// ============================================================================
// API Client Configuration
// ============================================================================

export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  data?: unknown;
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
}

// ============================================================================
// Auth Service Types
// ============================================================================

export interface AuthService {
  login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>>;
  register(data: RegisterData): Promise<ApiResponse<{ user: User; token: string }>>;
  logout(): Promise<ApiResponse<void>>;
  refreshToken(): Promise<ApiResponse<{ token: string }>>;
  getCurrentUser(): Promise<ApiResponse<User>>;
  updateProfile(data: Partial<User>): Promise<ApiResponse<User>>;
  changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<void>>;
  requestPasswordReset(email: string): Promise<ApiResponse<void>>;
  resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>>;
}

// ============================================================================
// Patient Service Types
// ============================================================================

export interface PatientService {
  getPatient(id: string): Promise<ApiResponse<Patient>>;
  getCurrentPatient(): Promise<ApiResponse<Patient>>;
  updatePatient(id: string, data: Partial<Patient>): Promise<ApiResponse<Patient>>;
  getMedicalHistory(id: string): Promise<ApiResponse<Patient['medicalHistory']>>;
  addMedicalHistory(
    id: string,
    history: Patient['medicalHistory'][0]
  ): Promise<ApiResponse<Patient>>;
}

// ============================================================================
// Doctor Service Types
// ============================================================================

export interface DoctorFilters {
  specialty?: string;
  availability?: boolean;
  minRating?: number;
  search?: string;
}

export interface DoctorService {
  getDoctor(id: string): Promise<ApiResponse<Doctor>>;
  getDoctors(filters?: DoctorFilters): Promise<ApiResponse<PaginatedResponse<Doctor>>>;
  getDoctorAvailability(id: string, date: string): Promise<ApiResponse<string[]>>;
  searchDoctors(query: string): Promise<ApiResponse<Doctor[]>>;
}

// ============================================================================
// Appointment Service Types
// ============================================================================

export interface AppointmentFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  doctorId?: string;
  patientId?: string;
}

export interface AppointmentService {
  getAppointment(id: string): Promise<ApiResponse<Appointment>>;
  getAppointments(
    filters?: AppointmentFilters
  ): Promise<ApiResponse<PaginatedResponse<Appointment>>>;
  createAppointment(data: CreateAppointmentData): Promise<ApiResponse<Appointment>>;
  updateAppointment(id: string, data: Partial<Appointment>): Promise<ApiResponse<Appointment>>;
  cancelAppointment(id: string, reason?: string): Promise<ApiResponse<Appointment>>;
  rescheduleAppointment(
    id: string,
    newDate: string,
    newTime: string
  ): Promise<ApiResponse<Appointment>>;
}

// ============================================================================
// Notification Service Types
// ============================================================================

export interface NotificationFilters {
  read?: boolean;
  type?: string;
  priority?: string;
}

export interface NotificationService {
  getNotifications(
    filters?: NotificationFilters
  ): Promise<ApiResponse<PaginatedResponse<Notification>>>;
  markAsRead(id: string): Promise<ApiResponse<Notification>>;
  markAllAsRead(): Promise<ApiResponse<void>>;
  deleteNotification(id: string): Promise<ApiResponse<void>>;
  getUnreadCount(): Promise<ApiResponse<{ count: number }>>;
}

// ============================================================================
// AI Assistant Service Types
// ============================================================================

export interface ChatRequest {
  message: string;
  sessionId?: string;
  context?: Record<string, unknown>;
}

export interface ChatResponse {
  message: string;
  sessionId: string;
  suggestions?: string[];
  requiresAction?: boolean;
  actionType?: string;
}

export interface AIAssistantService {
  sendMessage(request: ChatRequest): Promise<ApiResponse<ChatResponse>>;
  getChatHistory(sessionId: string): Promise<ApiResponse<ChatMessage[]>>;
  clearChatHistory(sessionId: string): Promise<ApiResponse<void>>;
  analyzeSymptoms(symptoms: string[]): Promise<ApiResponse<{ analysis: string; severity: string }>>;
}

// ============================================================================
// Error Handling Types
// ============================================================================

export interface ApiError {
  message: string;
  statusCode: number;
  code?: string;
  details?: Record<string, unknown>;
}

export interface NetworkError extends Error {
  isNetworkError: true;
  originalError: Error;
}

export interface TimeoutError extends Error {
  isTimeoutError: true;
  timeout: number;
}

// ============================================================================
// Request/Response Interceptors
// ============================================================================

export type RequestInterceptor = (
  config: RequestConfig
) => RequestConfig | Promise<RequestConfig>;

export type ResponseInterceptor<T = unknown> = (
  response: ApiResponse<T>
) => ApiResponse<T> | Promise<ApiResponse<T>>;

export type ErrorInterceptor = (error: ApiError) => Promise<never>;

// ============================================================================
// Type Guards
// ============================================================================

export function isNetworkError(error: unknown): error is NetworkError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isNetworkError' in error &&
    error.isNetworkError === true
  );
}

export function isTimeoutError(error: unknown): error is TimeoutError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isTimeoutError' in error &&
    error.isTimeoutError === true
  );
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'statusCode' in error
  );
}
