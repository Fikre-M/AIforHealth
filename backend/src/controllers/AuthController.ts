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
  static register = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        ResponseUtil.error(res, "Validation failed", 400, { errors: errors.array() });
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
        "User registered successfully",
        201
      );
    }
  );

  /**
   * Login user
   */
  static login = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        ResponseUtil.error(res, "Validation failed", 400, { errors: errors.array() });
        return;
      }
      const { email, password } = req.body;
      try {
        const result = await AuthService.login({ email, password });

        // Set HTTP-only cookies
        res.cookie('accessToken', result.tokens.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.cookie('refreshToken', result.tokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/api/v1/auth/refresh-token',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Return the response in the expected format
        ResponseUtil.success(
          res,
          {
            user: result.user,
            tokens: result.tokens,
          },
          "Login successful"
        );
      } catch (error: unknown) {
        console.error("Login error:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        ResponseUtil.error(res, errorMessage, 401);
      }
    }
  );

  /**
   * Refresh access token
   */
  static refreshToken = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        ResponseUtil.error(res, "Refresh token is required", 400);
        return;
      }

      const tokens = await AuthService.refreshToken({ refreshToken });

      ResponseUtil.success(res, { tokens }, "Token refreshed successfully");
    }
  );

  /**
   * Logout user
   */
  static logout = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      // In a stateless JWT system, logout is mainly handled client-side
      // But we can perform any server-side cleanup here
      const userId = (req as any).user?.userId;

      if (userId) {
        await AuthService.logout(userId);
      }

      ResponseUtil.success(res, null, "Logout successful");
    }
  );

  /**
   * Get current user profile
   */
  static getProfile = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = (req as any).user?.userId;

      if (!userId) {
        ResponseUtil.error(res, "User not authenticated", 401);
        return;
      }

      const user = await AuthService.getProfile(userId);
      if (!user) {
        ResponseUtil.error(res, "User not found", 404);
        return;
      }

      ResponseUtil.success(res, user, "Profile retrieved successfully");
    }
  );

  /**
   * Change password
   */
  static changePassword = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        ResponseUtil.error(res, "Validation failed", 400, { errors: errors.array() });
        return;
      }

      const userId = (req as any).user?.userId;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        ResponseUtil.error(res, "User not authenticated", 401);
        return;
      }

      const success = await AuthService.changePassword(
        userId,
        currentPassword,
        newPassword
      );
      if (success === undefined || success === null) {
        ResponseUtil.error(res, "Failed to change password", 400);
        return;
      }

      ResponseUtil.success(res, null, "Password changed successfully");
    }
  );

  /**
   * Request password reset
   */
  static requestPasswordReset = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        ResponseUtil.error(res, "Validation failed", 400, { errors: errors.array() });
        return;
      }

      const { email } = req.body;

      const success = await AuthService.requestPasswordReset(email);
      if (success === undefined || success === null) {
        ResponseUtil.error(res, "Failed to process password reset request", 400);
        return;
      }

      ResponseUtil.success(
        res,
        null,
        "If the email exists, a password reset link has been sent"
      );
    }
  );

  /**
   * Reset password with token
   */
  static resetPassword = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        ResponseUtil.error(res, "Validation failed", 400, { errors: errors.array() });
        return;
      }

      const { token, password } = req.body;

      const success = await AuthService.resetPassword(token, password);
      if (success === undefined || success === null) {
        ResponseUtil.error(res, "Failed to reset password", 400);
        return;
      }

      ResponseUtil.success(res, null, "Password reset successfully");
    }
  );

  /**
   * Verify email with token
   */
  static verifyEmail = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { token } = req.body;

      if (!token) {
        ResponseUtil.error(res, "Verification token is required", 400);
        return;
      }

      const success = await AuthService.verifyEmail(token);
      if (success === undefined || success === null) {
        ResponseUtil.error(res, "Failed to verify email", 400);
        return;
      }

      ResponseUtil.success(res, null, "Email verified successfully");
    }
  );

  /**
   * Update user profile
   */
  static updateProfile = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = (req as any).user?.userId;
      const { name, phone, specialization, licenseNumber } = req.body;

      if (!userId) {
        ResponseUtil.error(res, "User not authenticated", 401);
        return;
      }

      const user = await AuthService.updateProfile(userId, {
        name,
        phone,
        ...(specialization && { specialization }),
      });

      if (!user) {
        ResponseUtil.error(res, "Failed to update profile", 400);
        return;
      }

      ResponseUtil.success(res, { user }, "Profile updated successfully");
    }
  );

  /**
   * Get user settings
   */
  static getSettings = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = (req as any).user?.userId;

      if (!userId) {
        ResponseUtil.error(res, "User not authenticated", 401);
        return;
      }

      const settings = await AuthService.getSettings(userId);
      ResponseUtil.success(res, { settings }, "Settings retrieved successfully");
    }
  );

  /**
   * Upload user avatar
   */
  static uploadAvatar = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = (req as any).user?.userId;

      if (!userId) {
        ResponseUtil.error(res, "User not authenticated", 401);
        return;
      }

      // For now, we'll simulate avatar upload with a mock URL
      // In production, you would handle file upload to cloud storage (AWS S3, Cloudinary, etc.)
      const mockAvatarUrl = `/avatars/user-${userId}-${Date.now()}.jpg`;

      // Update user's avatar in database
      const user = await AuthService.updateProfile(userId, {
        avatar: mockAvatarUrl
      });

      if (!user) {
        ResponseUtil.error(res, "Failed to update avatar", 400);
        return;
      }

      ResponseUtil.success(res, { avatarUrl: mockAvatarUrl }, "Avatar uploaded successfully");
    }
  );

  /**
   * Update user settings
   */
  static updateSettings = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = (req as any).user?.userId;
      const settingsData = req.body;

      if (!userId) {
        ResponseUtil.error(res, "User not authenticated", 401);
        return;
      }

      const settings = await AuthService.updateSettings(userId, settingsData);
      ResponseUtil.success(res, { settings }, "Settings updated successfully");
    }
  );
}