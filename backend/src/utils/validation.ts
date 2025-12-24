import { body, ValidationChain } from 'express-validator';
import { UserRole, AppointmentStatus, AppointmentType } from '@/types';

/**
 * Validation utilities for user and appointment data
 */
export class ValidationUtil {
  /**
   * Validate user registration data
   */
  static validateUserRegistration(): ValidationChain[] {
    return [
      body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),

      body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .isLength({ max: 100 })
        .withMessage('Email cannot exceed 100 characters'),

      body('password')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be between 8 and 128 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage(
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        ),

      body('role')
        .optional()
        .isIn(Object.values(UserRole))
        .withMessage('Role must be either patient, doctor, or admin'),
    ];
  }

  /**
   * Validate user login data
   */
  static validateUserLogin(): ValidationChain[] {
    return [
      body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),

      body('password')
        .notEmpty()
        .withMessage('Password is required'),
    ];
  }

  /**
   * Validate password update
   */
  static validatePasswordUpdate(): ValidationChain[] {
    return [
      body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),

      body('newPassword')
        .isLength({ min: 8, max: 128 })
        .withMessage('New password must be between 8 and 128 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage(
          'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        ),

      body('confirmPassword')
        .custom((value, { req }) => {
          if (value !== req.body.newPassword) {
            throw new Error('Password confirmation does not match new password');
          }
          return true;
        }),
    ];
  }

  /**
   * Validate password reset request
   */
  static validatePasswordResetRequest(): ValidationChain[] {
    return [
      body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    ];
  }

  /**
   * Validate password reset
   */
  static validatePasswordReset(): ValidationChain[] {
    return [
      body('token')
        .notEmpty()
        .withMessage('Reset token is required'),

      body('password')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be between 8 and 128 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage(
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        ),

      body('confirmPassword')
        .custom((value, { req }) => {
          if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
          }
          return true;
        }),
    ];
  }

  /**
   * Validate user profile update
   */
  static validateUserProfileUpdate(): ValidationChain[] {
    return [
      body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),

      body('email')
        .optional()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .isLength({ max: 100 })
        .withMessage('Email cannot exceed 100 characters'),
    ];
  }

  /**
   * Validate appointment creation
   */
  static validateAppointmentCreation(): ValidationChain[] {
    return [
      body('patientId')
        .notEmpty()
        .withMessage('Patient ID is required')
        .isMongoId()
        .withMessage('Invalid patient ID format'),

      body('doctorId')
        .notEmpty()
        .withMessage('Doctor ID is required')
        .isMongoId()
        .withMessage('Invalid doctor ID format'),

      body('appointmentDate')
        .notEmpty()
        .withMessage('Appointment date is required')
        .isISO8601()
        .withMessage('Invalid date format')
        .custom((value) => {
          const appointmentDate = new Date(value);
          const now = new Date();
          if (appointmentDate <= now) {
            throw new Error('Appointment date must be in the future');
          }
          return true;
        }),

      body('duration')
        .optional()
        .isInt({ min: 15, max: 240 })
        .withMessage('Duration must be between 15 and 240 minutes'),

      body('type')
        .optional()
        .isIn(Object.values(AppointmentType))
        .withMessage('Invalid appointment type'),

      body('reason')
        .notEmpty()
        .withMessage('Reason for appointment is required')
        .isLength({ min: 5, max: 500 })
        .withMessage('Reason must be between 5 and 500 characters'),

      body('symptoms')
        .optional()
        .isArray()
        .withMessage('Symptoms must be an array'),

      body('symptoms.*')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Each symptom cannot exceed 100 characters'),

      body('notes')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Notes cannot exceed 1000 characters'),

      body('isEmergency')
        .optional()
        .isBoolean()
        .withMessage('isEmergency must be a boolean'),
    ];
  }

  /**
   * Validate appointment update
   */
  static validateAppointmentUpdate(): ValidationChain[] {
    return [
      body('appointmentDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid date format')
        .custom((value) => {
          if (value) {
            const appointmentDate = new Date(value);
            const now = new Date();
            if (appointmentDate <= now) {
              throw new Error('Appointment date must be in the future');
            }
          }
          return true;
        }),

      body('duration')
        .optional()
        .isInt({ min: 15, max: 240 })
        .withMessage('Duration must be between 15 and 240 minutes'),

      body('type')
        .optional()
        .isIn(Object.values(AppointmentType))
        .withMessage('Invalid appointment type'),

      body('reason')
        .optional()
        .isLength({ min: 5, max: 500 })
        .withMessage('Reason must be between 5 and 500 characters'),

      body('status')
        .optional()
        .isIn(Object.values(AppointmentStatus))
        .withMessage('Invalid appointment status'),

      body('doctorNotes')
        .optional()
        .isLength({ max: 2000 })
        .withMessage('Doctor notes cannot exceed 2000 characters'),

      body('prescription')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Prescription cannot exceed 1000 characters'),

      body('diagnosis')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Diagnosis cannot exceed 1000 characters'),

      body('followUpRequired')
        .optional()
        .isBoolean()
        .withMessage('followUpRequired must be a boolean'),

      body('followUpDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid follow-up date format'),
    ];
  }

  /**
   * Validate appointment cancellation
   */
  static validateAppointmentCancellation(): ValidationChain[] {
    return [
      body('cancellationReason')
        .notEmpty()
        .withMessage('Cancellation reason is required')
        .isLength({ min: 5, max: 500 })
        .withMessage('Cancellation reason must be between 5 and 500 characters'),
    ];
  }

  /**
   * Validate appointment rescheduling
   */
  static validateAppointmentReschedule(): ValidationChain[] {
    return [
      body('newDate')
        .notEmpty()
        .withMessage('New appointment date is required')
        .isISO8601()
        .withMessage('Invalid date format')
        .custom((value) => {
          const appointmentDate = new Date(value);
          const now = new Date();
          if (appointmentDate <= now) {
            throw new Error('New appointment date must be in the future');
          }
          return true;
        }),

      body('reason')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Reason cannot exceed 500 characters'),
    ];
  }

  /**
   * Validate appointment completion
   */
  static validateAppointmentCompletion(): ValidationChain[] {
    return [
      body('doctorNotes')
        .optional()
        .isLength({ max: 2000 })
        .withMessage('Doctor notes cannot exceed 2000 characters'),

      body('prescription')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Prescription cannot exceed 1000 characters'),

      body('diagnosis')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Diagnosis cannot exceed 1000 characters'),

      body('followUpRequired')
        .optional()
        .isBoolean()
        .withMessage('followUpRequired must be a boolean'),

      body('followUpDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid follow-up date format'),
    ];
  }
}