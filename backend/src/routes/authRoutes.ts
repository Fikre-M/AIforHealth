import { Router } from 'express';
import { ValidationUtil } from '@/utils/validation';
import { AuthController } from '@/controllers/AuthController';
import { authenticate } from '@/middleware/auth';

const router = Router();

/**
 * ================================
 * Public Authentication Routes
 * ================================
 */

// Register
router.post('/register', ValidationUtil.validateUserRegistration(), AuthController.register);

// Login
router.post('/login', ValidationUtil.validateUserLogin(), AuthController.login);

// Forgot Password
router.post(
  '/forgot-password',
  ValidationUtil.validatePasswordResetRequest(),
  AuthController.requestPasswordReset
);

// Reset Password
router.post(
  '/reset-password',
  ValidationUtil.validatePasswordReset(),
  AuthController.resetPassword
);

// Refresh Token
router.post('/refresh-token', AuthController.refreshToken);

// Verify Email
router.post('/verify-email', AuthController.verifyEmail);

/**
 * ================================
 * Protected Authentication Routes
 * ================================
 */

// Change Password ✅ FIXED: Now PUT (matches API contract & tests)
router.put(
  '/change-password',
  authenticate,
  ValidationUtil.validatePasswordUpdate(),
  AuthController.changePassword
);

// Logout
router.post('/logout', authenticate, AuthController.logout);

// Get Profile
router.get('/profile', authenticate, AuthController.getProfile);

// Update Profile
router.put('/profile', authenticate, AuthController.updateProfile);

// Upload Avatar
router.post('/profile/avatar', authenticate, AuthController.uploadAvatar);

// Get Settings
router.get('/settings', authenticate, AuthController.getSettings);

// Update Settings
router.put('/settings', authenticate, AuthController.updateSettings);

export default router;
