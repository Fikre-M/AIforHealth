import { body, ValidationChain } from 'express-validator';
import { UserRole } from '@/types';

/**
 * Validation utilities for user data
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
}