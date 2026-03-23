import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthService } from '@/services/AuthService';
import { ResponseUtil, asyncHandler } from '@/utils';
import { UserRole } from '@/types';

export class AuthController {
  static register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      ResponseUtil.error(res, 'Validation failed', 400, { errors: errors.array() });
      return;
    }
    const { name, email, password, role } = req.body;
    const result = await AuthService.register({
      name,
      email,
      password,
      role: (role as UserRole) || UserRole.PATIENT,
    });
    ResponseUtil.success(
      res,
      { user: result.user, tokens: result.tokens },
      'User registered successfully',
      201
    );
  });

  static login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      ResponseUtil.error(res, 'Validation failed', 400, { errors: errors.array() });
      return;
    }
    const { email, password } = req.body;
    try {
      const result = await AuthService.login({ email, password });
      res.cookie('accessToken', result.tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api/v1/auth/refresh-token',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      ResponseUtil.success(res, { user: result.user, tokens: result.tokens }, 'Login successful');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'An unknown error occurred';
      ResponseUtil.error(res, msg, 401);
    }
  });

  static refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      ResponseUtil.error(res, 'Refresh token is required', 400);
      return;
    }
    const tokens = await AuthService.refreshToken({ refreshToken });
    ResponseUtil.success(res, { tokens }, 'Token refreshed successfully');
  });

  static logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = (req as Request & { user?: { userId: string } }).user?.userId;
    if (userId) await AuthService.logout(userId);
    ResponseUtil.success(res, null, 'Logout successful');
  });

  static getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = (req as Request & { user?: { userId: string } }).user?.userId;
    if (!userId) {
      ResponseUtil.error(res, 'User not authenticated', 401);
      return;
    }
    const user = await AuthService.getProfile(userId);
    if (!user) {
      ResponseUtil.error(res, 'User not found', 404);
      return;
    }
    ResponseUtil.success(res, { user }, 'Profile retrieved successfully');
  });

  static changePassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      ResponseUtil.error(res, 'Validation failed', 400, { errors: errors.array() });
      return;
    }
    const userId = (req as Request & { user?: { userId: string } }).user?.userId;
    const { currentPassword, newPassword } = req.body;
    if (!userId) {
      ResponseUtil.error(res, 'User not authenticated', 401);
      return;
    }
    await AuthService.changePassword(userId, currentPassword, newPassword);
    ResponseUtil.success(res, null, 'Password changed successfully');
  });

  static requestPasswordReset = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      ResponseUtil.error(res, 'Validation failed', 400, { errors: errors.array() });
      return;
    }
    const { email } = req.body;
    await AuthService.requestPasswordReset(email);
    ResponseUtil.success(res, null, 'If the email exists, a password reset link has been sent');
  });

  static resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      ResponseUtil.error(res, 'Validation failed', 400, { errors: errors.array() });
      return;
    }
    const { token, password } = req.body;
    await AuthService.resetPassword(token, password);
    ResponseUtil.success(res, null, 'Password reset successfully');
  });

  static verifyEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { token } = req.body;
    if (!token) {
      ResponseUtil.error(res, 'Verification token is required', 400);
      return;
    }
    await AuthService.verifyEmail(token);
    ResponseUtil.success(res, null, 'Email verified successfully');
  });

  static updateProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = (req as Request & { user?: { userId: string } }).user?.userId;
    if (!userId) {
      ResponseUtil.error(res, 'User not authenticated', 401);
      return;
    }

    const {
      name,
      phone,
      specialization,
      licenseNumber,
      dateOfBirth,
      gender,
      address,
      emergencyContact,
      medicalInfo,
    } = req.body;

    const user = await AuthService.updateProfile(userId, {
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone }),
      ...(specialization !== undefined && { specialization }),
      ...(licenseNumber !== undefined && { licenseNumber }),
      ...(dateOfBirth !== undefined && { dateOfBirth: new Date(dateOfBirth) }),
      ...(gender !== undefined && { gender }),
      ...(address !== undefined && { address }),
      ...(emergencyContact !== undefined && { emergencyContact }),
      ...(medicalInfo !== undefined && { medicalInfo }),
    });

    if (!user) {
      ResponseUtil.error(res, 'Failed to update profile', 400);
      return;
    }
    ResponseUtil.success(res, { user }, 'Profile updated successfully');
  });

  static uploadAvatar = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = (req as Request & { user?: { userId: string } }).user?.userId;
    if (!userId) {
      ResponseUtil.error(res, 'User not authenticated', 401);
      return;
    }

    const { avatarBase64 } = req.body;
    if (!avatarBase64 || typeof avatarBase64 !== 'string') {
      ResponseUtil.error(res, 'Avatar image data is required', 400);
      return;
    }
    if (!avatarBase64.startsWith('data:image/')) {
      ResponseUtil.error(res, 'Invalid image format', 400);
      return;
    }
    if (avatarBase64.length > 2_800_000) {
      ResponseUtil.error(res, 'Image too large. Maximum size is 2MB', 400);
      return;
    }

    const user = await AuthService.updateProfile(userId, { avatar: avatarBase64 });
    if (!user) {
      ResponseUtil.error(res, 'Failed to update avatar', 400);
      return;
    }
    ResponseUtil.success(res, { avatarUrl: avatarBase64 }, 'Avatar uploaded successfully');
  });

  static getSettings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = (req as Request & { user?: { userId: string } }).user?.userId;
    if (!userId) {
      ResponseUtil.error(res, 'User not authenticated', 401);
      return;
    }
    const settings = await AuthService.getSettings(userId);
    ResponseUtil.success(res, { settings }, 'Settings retrieved successfully');
  });

  static updateSettings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = (req as Request & { user?: { userId: string } }).user?.userId;
    if (!userId) {
      ResponseUtil.error(res, 'User not authenticated', 401);
      return;
    }
    const settings = await AuthService.updateSettings(userId, req.body);
    ResponseUtil.success(res, { settings }, 'Settings updated successfully');
  });
}
