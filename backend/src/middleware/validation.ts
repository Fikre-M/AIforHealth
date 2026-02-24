import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ValidationUtil } from '@/utils/validation';
import { ResponseUtil } from '@/utils/response';

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined
    }));

    ResponseUtil.error(res, 'Validation failed', 400, {
      code: 'VALIDATION_ERROR',
      errors: errorMessages
    });
    return;
  }
  
  next();
};

/**
 * Generic validation middleware factory
 * Usage: validate([body('field').isEmail(), body('name').notEmpty()])
 */
export const validate = (validations: ValidationChain[]) => {
  return [
    ...validations,
    handleValidationErrors
  ];
};

/**
 * Validation middleware for user registration
 */
export const validateUserRegistration = [
  ...ValidationUtil.validateUserRegistration(),
  handleValidationErrors
];

/**
 * Validation middleware for user login
 */
export const validateUserLogin = [
  ...ValidationUtil.validateUserLogin(),
  handleValidationErrors
];

/**
 * Validation middleware for password update
 */
export const validatePasswordUpdate = [
  ...ValidationUtil.validatePasswordUpdate(),
  handleValidationErrors
];

/**
 * Validation middleware for password reset request
 */
export const validatePasswordResetRequest = [
  ...ValidationUtil.validatePasswordResetRequest(),
  handleValidationErrors
];

/**
 * Validation middleware for password reset
 */
export const validatePasswordReset = [
  ...ValidationUtil.validatePasswordReset(),
  handleValidationErrors
];

/**
 * Validation middleware for user profile update
 */
export const validateUserProfileUpdate = [
  ...ValidationUtil.validateUserProfileUpdate(),
  handleValidationErrors
];

/**
 * Validation middleware for appointment creation
 */
export const validateAppointmentCreation = [
  ...ValidationUtil.validateAppointmentCreation(),
  handleValidationErrors
];

/**
 * Validation middleware for appointment update
 */
export const validateAppointmentUpdate = [
  ...ValidationUtil.validateAppointmentUpdate(),
  handleValidationErrors
];

/**
 * Validation middleware for appointment cancellation
 */
export const validateAppointmentCancellation = [
  ...ValidationUtil.validateAppointmentCancellation(),
  handleValidationErrors
];

/**
 * Validation middleware for appointment rescheduling
 */
export const validateAppointmentReschedule = [
  ...ValidationUtil.validateAppointmentReschedule(),
  handleValidationErrors
];

/**
 * Validation middleware for appointment completion
 */
export const validateAppointmentCompletion = [
  ...ValidationUtil.validateAppointmentCompletion(),
  handleValidationErrors
];


/**
 * Validation middleware for patient creation by doctor
 */
export const validatePatientCreation = [
  ...ValidationUtil.validatePatientCreation(),
  handleValidationErrors
];

/**
 * Validation middleware for date range queries
 */
export const validateDateRange = [
  ...ValidationUtil.validateDateRange(),
  handleValidationErrors
];

/**
 * Validation middleware for pagination
 */
export const validatePagination = [
  ...ValidationUtil.validatePagination(),
  handleValidationErrors
];

/**
 * Validation middleware for search queries
 */
export const validateSearch = [
  ...ValidationUtil.validateSearch(),
  handleValidationErrors
];
