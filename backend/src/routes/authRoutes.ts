import { Router } from 'express';
import { AuthController } from '@/controllers/AuthController';
import { ValidationUtil } from '@/utils';
import { authenticate } from '@/middleware/auth';

const router = Router();

// Public authentication routes
router.post('/register', ValidationUtil.validateUserRegistration(), AuthController.register);
router.post('/login', ValidationUtil.validateUserLogin(), AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post(
  '/request-password-reset',
  ValidationUtil.validatePasswordResetRequest(),
  AuthController.requestPasswordReset
);
router.post(
  '/reset-password',
  ValidationUtil.validatePasswordReset(),
  AuthController.resetPassword
);
router.post('/verify-email', AuthController.verifyEmail);

// Protected authentication routes
router.post('/logout', authenticate, AuthController.logout);
router.get('/profile', authenticate, AuthController.getProfile);
router.put('/profile', authenticate, AuthController.updateProfile);
router.get('/settings', authenticate, AuthController.getSettings);
router.put('/settings', authenticate, AuthController.updateSettings);
router.put(
  '/change-password',
  authenticate,
  ValidationUtil.validatePasswordUpdate(),
  AuthController.changePassword
);

export default router;
