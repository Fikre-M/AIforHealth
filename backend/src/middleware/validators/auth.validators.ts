// backend/src/middleware/validators/auth.validators.ts
import { body } from 'express-validator';
import { baseValidators } from './base.validators';
import { ValidatorBuilder, validationRegistry } from './index';

export const authValidators = {
  // Register new user
  register: new ValidatorBuilder()
    .add([
      baseValidators.email('email'),
      baseValidators.password('password'),
      baseValidators.name('firstName'),
      baseValidators.name('lastName'),
      baseValidators.phone('phone', true),
      baseValidators.enum('role', ['patient', 'doctor', 'admin', 'receptionist']),
      body('termsAccepted')
        .isBoolean()
        .custom((value) => value === true)
        .withMessage('You must accept the terms and conditions'),
    ])
    .build(),

  // Login user
  login: new ValidatorBuilder()
    .add([
      baseValidators.email('email'),
      body('password').notEmpty().withMessage('Password is required'),
    ])
    .build(),

  // Forgot password request
  forgotPassword: new ValidatorBuilder().add([baseValidators.email('email')]).build(),

  // Reset password with token
  resetPassword: new ValidatorBuilder()
    .add([
      baseValidators.id('token', 'param'),
      baseValidators.password('newPassword'),
      body('confirmPassword')
        .custom((value, { req }) => value === req.body.newPassword)
        .withMessage('Passwords do not match'),
    ])
    .build(),

  // Change password (authenticated user)
  changePassword: new ValidatorBuilder()
    .add([
      body('currentPassword').notEmpty().withMessage('Current password is required'),
      baseValidators.password('newPassword'),
      body('confirmNewPassword')
        .custom((value, { req }) => value === req.body.newPassword)
        .withMessage('New passwords do not match'),
    ])
    .build(),

  // Refresh token
  refreshToken: new ValidatorBuilder()
    .add([
      body('refreshToken')
        .notEmpty()
        .withMessage('Refresh token is required')
        .isJWT()
        .withMessage('Invalid refresh token format'),
    ])
    .build(),

  // Verify email
  verifyEmail: new ValidatorBuilder().add([baseValidators.id('token', 'param')]).build(),

  // Resend verification email
  resendVerification: new ValidatorBuilder().add([baseValidators.email('email')]).build(),

  // Update profile (authenticated user)
  updateProfile: new ValidatorBuilder()
    .add([
      body('firstName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('First name must be 2-100 characters'),
      body('lastName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Last name must be 2-100 characters'),
      baseValidators.phone('phone', false),
      body('profilePicture').optional().isURL().withMessage('Invalid profile picture URL'),
    ])
    .build(),

  // Logout
  logout: new ValidatorBuilder()
    .add([body('refreshToken').optional().isJWT().withMessage('Invalid refresh token format')])
    .build(),
};

// Register validators for programmatic use
validationRegistry.register('auth:register', authValidators.register as any);
validationRegistry.register('auth:login', authValidators.login as any);
validationRegistry.register('auth:forgotPassword', authValidators.forgotPassword as any);
validationRegistry.register('auth:resetPassword', authValidators.resetPassword as any);
