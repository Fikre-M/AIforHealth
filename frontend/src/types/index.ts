/**
 * Core Type Definitions for Frontend
 * 
 * This file contains all shared types used across the application.
 * Use strict typing to avoid 'any' types.
 */

// ============================================================================
// User & Authentication Types
// ============================================================================

export type UserRole = 'patient' | 'doctor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

// ============================================================================
// Patient Types
// ============================================================================

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface MedicalHistory {
  condition: string;
  diagnosedDate: string;
  status: 'active' | 'resolved';
  notes?: string;
}

export interface Patient {
  id: string;
  userId: string;
  dateOfBirth: string;
  phone: string;
  address: Address;
  emergencyContact: EmergencyContact;
  medicalHistory: MedicalHistory[];
  allergies: string[];
  medications: string[];
  bloodType?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Doctor Types
// ============================================================================

export type DoctorSpecialty =
  | 'Cardiology'
  | 'Dermatology'
  | 'Endocrinology'
  | 'Gastroenterology'
  | 'Neurology'
  | 'Oncology'
  | 'Orthopedics'
  | 'Pediatrics'
  | 'Psychiatry'
  | 'General Practice';

export interface DoctorAvailability {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

export interface Doctor {
  id: string;
  userId: string;
  specialty: DoctorSpecialty;
  licenseNumber: string;
  phone: string;
  clinicName?: string; // Add clinicName property
  bio?: string;
  education: string[];
  experience: number; // years
  availability: DoctorAvailability[];
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Appointment Types
// ============================================================================

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in-progress'
  | 'completed'
  | 'cancelled'
  | 'no-show';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string; // ISO date string
  time: string; // HH:mm format
  duration: number; // minutes
  status: AppointmentStatus;
  type?: 'consultation' | 'follow-up' | 'emergency' | 'routine'; // Add type property
  reason: string;
  notes?: string;
  diagnosis?: string;
  prescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentWithDetails extends Appointment {
  patient: Patient;
  doctor: Doctor;
}

export interface CreateAppointmentData {
  doctorId: string;
  date: string;
  time: string;
  reason: string;
  notes?: string;
}

// ============================================================================
// Notification Types
// ============================================================================

export type NotificationType =
  | 'appointment_reminder'
  | 'appointment_confirmed'
  | 'appointment_cancelled'
  | 'message'
  | 'system';

export type NotificationPriority = 'low' | 'medium' | 'high';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

// ============================================================================
// AI Assistant Types
// ============================================================================

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role?: MessageRole; // Make role optional for backward compatibility
  sender?: 'user' | 'ai'; // Add sender as optional alias for backward compatibility
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AIResponse {
  message: string;
  suggestions?: string[];
  requiresAction?: boolean;
  actionType?: 'book_appointment' | 'view_records' | 'contact_doctor';
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// Form Types
// ============================================================================

export interface FormFieldError {
  field: string;
  message: string;
}

export interface FormState<T> {
  values: T;
  errors: FormFieldError[];
  touched: Set<keyof T>;
  isSubmitting: boolean;
  isValid: boolean;
}

// ============================================================================
// UI State Types
// ============================================================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

export interface FilterState {
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  filters: Record<string, unknown>;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Make all properties of T required and non-nullable
 */
export type RequiredNotNull<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};

/**
 * Make specific properties of T optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific properties of T required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Extract the type of array elements
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

/**
 * Extract the resolved type of a Promise
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * Type-safe keys of an object
 */
export type KeysOf<T> = keyof T;

/**
 * Type-safe values of an object
 */
export type ValuesOf<T> = T[keyof T];

// ============================================================================
// Type Guards
// ============================================================================

export function isApiSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
  return response.success === true;
}

export function isApiErrorResponse<T>(
  response: ApiResponse<T>
): response is ApiErrorResponse {
  return response.success === false;
}

export function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value &&
    'name' in value &&
    'role' in value
  );
}

export function isPatient(value: unknown): value is Patient {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'userId' in value &&
    'dateOfBirth' in value
  );
}

export function isDoctor(value: unknown): value is Doctor {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'userId' in value &&
    'specialty' in value
  );
}

// ============================================================================
// Constants
// ============================================================================

export const USER_ROLES: readonly UserRole[] = ['patient', 'doctor', 'admin'] as const;

export const APPOINTMENT_STATUSES: readonly AppointmentStatus[] = [
  'scheduled',
  'confirmed',
  'in-progress',
  'completed',
  'cancelled',
  'no-show',
] as const;

export const DOCTOR_SPECIALTIES: readonly DoctorSpecialty[] = [
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'Neurology',
  'Oncology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'General Practice',
] as const;
