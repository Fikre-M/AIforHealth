/**
 * Core Type Definitions for Backend
 * 
 * This file contains all shared types used across the backend application.
 * Use strict typing to avoid 'any' types.
 */

import { Request } from 'express';
import { Document, Types } from 'mongoose';

// Re-export enums
export * from './enums';

// ============================================================================
// User & Authentication Types
// ============================================================================

// UserRole enum is exported from enums.ts

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  role: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface JWTPayload {
  userId: string;
  role: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

// ============================================================================
// Patient Types
// ============================================================================

export interface IAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

export interface IEmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface IMedicalHistory {
  condition: string;
  diagnosedDate: Date;
  status: 'active' | 'resolved';
  notes?: string;
}

export interface IPatient extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  dateOfBirth: Date;
  phone: string;
  address: IAddress;
  emergencyContact: IEmergencyContact;
  medicalHistory: IMedicalHistory[];
  allergies: string[];
  medications: string[];
  bloodType?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Doctor Types
// ============================================================================

// DoctorSpecialty enum is exported from enums.ts

export interface IDoctorAvailability {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

export interface IDoctor extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  specialty: string;
  licenseNumber: string;
  phone: string;
  bio?: string;
  education: string[];
  experience: number; // years
  availability: IDoctorAvailability[];
  consultationFee: number;
  rating?: number;
  reviewCount?: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Appointment Types
// ============================================================================

// AppointmentStatus enum is exported from enums.ts

export interface IAppointment extends Document {
  _id: Types.ObjectId;
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  date: Date;
  time: string; // HH:mm format
  duration: number; // minutes
  status: string;
  reason: string;
  notes?: string;
  diagnosis?: string;
  prescription?: string;
  followUpRequired: boolean;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Notification Types
// ============================================================================

// NotificationType and NotificationPriority enums are exported from enums.ts

export interface INotification extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: string;
  priority: string;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// AI Assistant Types
// ============================================================================

// MessageRole enum is exported from enums.ts

export interface IChatMessage {
  role: string;
  content: string;
  timestamp: Date;
}

export interface IChatSession extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  messages: IChatMessage[];
  context?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
  stack?: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// ============================================================================
// Service Layer Types
// ============================================================================

export interface CreateUserDTO {
  email: string;
  password: string;
  name: string;
  role: string;
}

export interface UpdateUserDTO {
  email?: string;
  name?: string;
  password?: string;
}

export interface CreatePatientDTO {
  userId: string;
  dateOfBirth: Date;
  phone: string;
  address: IAddress;
  emergencyContact: IEmergencyContact;
}

export interface UpdatePatientDTO {
  phone?: string;
  address?: Partial<IAddress>;
  emergencyContact?: Partial<IEmergencyContact>;
  allergies?: string[];
  medications?: string[];
}

export interface CreateDoctorDTO {
  userId: string;
  specialty: string;
  licenseNumber: string;
  phone: string;
  bio?: string;
  education: string[];
  experience: number;
  consultationFee: number;
}

export interface UpdateDoctorDTO {
  phone?: string;
  bio?: string;
  availability?: IDoctorAvailability[];
  consultationFee?: number;
  isAvailable?: boolean;
}

export interface CreateAppointmentDTO {
  patientId: string;
  doctorId: string;
  date: Date;
  time: string;
  reason: string;
  notes?: string;
}

export interface UpdateAppointmentDTO {
  date?: Date;
  time?: string;
  status?: string;
  notes?: string;
  diagnosis?: string;
  prescription?: string;
}

// ============================================================================
// Query Types
// ============================================================================

export interface QueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  populate?: string[];
  select?: string[];
}

export interface FilterOptions {
  search?: string;
  status?: string;
  role?: string;
  specialty?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// ============================================================================
// Validation Types
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ============================================================================
// Error Types
// ============================================================================

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(404, message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', public errors?: ValidationError[]) {
    super(400, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(403, message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(409, message);
  }
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
 * Omit _id and timestamps from Mongoose documents
 */
export type WithoutMongooseFields<T> = Omit<T, '_id' | 'createdAt' | 'updatedAt' | '__v'>;

/**
 * Convert Mongoose document to plain object
 */
export type DocumentToObject<T extends Document> = Omit<
  T,
  keyof Document | '__v'
> & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

// ============================================================================
// Type Guards
// ============================================================================

export function isValidObjectId(id: unknown): id is string {
  return typeof id === 'string' && Types.ObjectId.isValid(id);
}

// ============================================================================
// Constants
// ============================================================================

export const USER_ROLES = ['patient', 'doctor', 'admin'] as const;

export const APPOINTMENT_STATUSES = [
  'scheduled',
  'confirmed',
  'in-progress',
  'completed',
  'cancelled',
  'no-show',
] as const;

export const DOCTOR_SPECIALTIES = [
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

export const NOTIFICATION_TYPES = [
  'appointment_reminder',
  'appointment_confirmed',
  'appointment_cancelled',
  'message',
  'system',
] as const;

export const NOTIFICATION_PRIORITIES = [
  'low',
  'medium',
  'high',
] as const;
