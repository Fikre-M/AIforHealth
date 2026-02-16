/**
 * Enums for Backend
 * 
 * This file contains all enum definitions that can be used with Object.values()
 * These are actual runtime values, not just TypeScript types.
 */

// ============================================================================
// User & Authentication Enums
// ============================================================================

export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin',
}

// ============================================================================
// Appointment Enums
// ============================================================================

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no-show',
}

export enum AppointmentType {
  CONSULTATION = 'consultation',
  FOLLOW_UP = 'follow-up',
  EMERGENCY = 'emergency',
  ROUTINE_CHECKUP = 'routine-checkup',
  VACCINATION = 'vaccination',
  LAB_TEST = 'lab-test',
}

// ============================================================================
// Notification Enums
// ============================================================================

export enum NotificationType {
  APPOINTMENT_REMINDER = 'appointment_reminder',
  APPOINTMENT_CONFIRMED = 'appointment_confirmed',
  APPOINTMENT_CANCELLED = 'appointment_cancelled',
  MESSAGE = 'message',
  SYSTEM = 'system',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  READ = 'read',
}

export enum NotificationChannel {
  IN_APP = 'in-app',
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

// ============================================================================
// AI Assistant Enums
// ============================================================================

export enum AIConversationStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  ARCHIVED = 'archived',
}

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

// ============================================================================
// Health Reminder Enums
// ============================================================================

export enum ReminderType {
  MEDICATION = 'medication',
  APPOINTMENT = 'appointment',
  EXERCISE = 'exercise',
  DIET = 'diet',
  CHECKUP = 'checkup',
  CUSTOM = 'custom',
}

export enum ReminderPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

// ============================================================================
// Health Metric Enums
// ============================================================================

export enum MetricType {
  BLOOD_PRESSURE = 'blood-pressure',
  HEART_RATE = 'heart-rate',
  BLOOD_SUGAR = 'blood-sugar',
  WEIGHT = 'weight',
  TEMPERATURE = 'temperature',
  OXYGEN_SATURATION = 'oxygen-saturation',
  BMI = 'bmi',
  STEPS = 'steps',
  SLEEP = 'sleep',
  CUSTOM = 'custom',
}

export enum MetricStatus {
  NORMAL = 'normal',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

export enum MetricTrend {
  IMPROVING = 'improving',
  STABLE = 'stable',
  DECLINING = 'declining',
}

// ============================================================================
// Doctor Specialty Enum
// ============================================================================

export enum DoctorSpecialty {
  CARDIOLOGY = 'Cardiology',
  DERMATOLOGY = 'Dermatology',
  ENDOCRINOLOGY = 'Endocrinology',
  GASTROENTEROLOGY = 'Gastroenterology',
  NEUROLOGY = 'Neurology',
  ONCOLOGY = 'Oncology',
  ORTHOPEDICS = 'Orthopedics',
  PEDIATRICS = 'Pediatrics',
  PSYCHIATRY = 'Psychiatry',
  GENERAL_PRACTICE = 'General Practice',
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get all values of an enum as an array
 */
export function getEnumValues<T extends Record<string, string>>(enumObj: T): string[] {
  return Object.values(enumObj);
}

/**
 * Check if a value is a valid enum value
 */
export function isValidEnumValue<T extends Record<string, string>>(
  enumObj: T,
  value: unknown
): value is T[keyof T] {
  return typeof value === 'string' && Object.values(enumObj).includes(value);
}
