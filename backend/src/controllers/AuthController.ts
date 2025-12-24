import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthService } from '@/services/AuthService';
import { ResponseUtil, asyncHandler } from '@/utils';
import { UserRole } from '@/types';

/**
 * Authentication controller for handling auth-related HTTP requests
 */
export class AuthController {
  /**
   * Register a new user
   */
  static register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      ResponseUtil.error(res, 'Validation failed', 400, errors.array());
      return;
    }

    const { name, email, password, role } = req.body;

    const result = await AuthService.register({
      name,
      email,
      password,
      role: role || UserRole.PATIENT,
    });

    ResponseUtil.success(
      res,
      {
        user: result.user,
        tokens: result.tokens,
      },
      'User registered successfully',
      201
    );
  });

  /**
   * Login user
   */
  static login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      ResponseUtil.error(res, 'Validation failed', 400, errors.array());
      return;
    }

    const { email, password } = req.body;

    const result = await AuthService.login({ email, password });

    ResponseUtil.success(
      res,
      {
        user: result.user,
        tokens: result.tokens,
      },
      'Login successful'
    );
  });

  /**
   * Refresh access token
   */
  static refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      ResponseUtil.error(res, 'Refresh token is required', 400);
      return;
    }

    const tokens = await AuthService.refreshToken({ refreshToken });

    ResponseUtil.success(res, { tokens }, 'Token refreshed successfully');
  });

  /**
   * Logout user
   */
  static logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // In a stateless JWT system, logout is mainly handled client-side
    // But we can perform any server-side cleanup here
    const userId = (req as any).user?.userId;

    if (userId) {
      await AuthService.logout(userId);
    }

    ResponseUtil.success(res, null, 'Logout successful');
  });

  /**
   * Get current user profile
   */
  static getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?.userId;

    if (!userId) {
      ResponseUtil.error(res, 'User not authenticated', 401);
      return;
    }

    const user = await AuthService.getProfile(userId);
    if (!user) {
      ResponseUtil.error(res, 'User not found', 404);
      return;
    }

    ResponseUtil.success(res, user, 'Profile retrieved successfully');
  });

  /**
   * Change password
   */
  static changePassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      ResponseUtil.error(res, 'Validation failed', 400, errors.array());
      return;
    }

    const userId = (req as any).user?.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      ResponseUtil.error(res, 'User not authenticated', 401);
      return;
    }

    const success = await AuthService.changePassword(userId, currentPassword, newPassword);
    if (!success) {
      ResponseUtil.error(res, 'Failed to change password', 400);
      return;
    }

    ResponseUtil.success(res, null, 'Password changed successfully');
  });

  /**
   * Request password reset
   */
  static requestPasswordReset = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      ResponseUtil.error(res, 'Validation failed', 400, errors.array());
      return;
    }

    const { email } = req.body;

    // Generate reset token (in production, send via email)
    const resetToken = await AuthService.requestPasswordReset(email);

    // In development, return the token. In production, just return success message
    const responseData = process.env.NODE_ENV === 'development' ? { resetToken } : null;

    ResponseUtil.success(
      res,
      responseData,
      'If the email exists, a password reset link has been sent'
    );
  });

  /**
   * Reset password with token
   */
  static resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      ResponseUtil.error(res, 'Validation failed', 400, errors.array());
      return;
    }

    const { token, password } = req.body;

    const success = await AuthService.resetPassword(token, password);
    if (!success) {
      ResponseUtil.error(res, 'Failed to reset password', 400);
      return;
    }

    ResponseUtil.success(res, null, 'Password reset successfully');
  });

  /**
   * Verify email with token
   */
  static verifyEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { token } = req.body;

    if (!token) {
      ResponseUtil.error(res, 'Verification token is required', 400);
      return;
    }

    const success = await AuthService.verifyEmail(token);
    if (!success) {
      ResponseUtil.error(res, 'Failed to verify email', 400);
      return;
    }

    ResponseUtil.success(res, null, 'Email verified successfully');
  });
}