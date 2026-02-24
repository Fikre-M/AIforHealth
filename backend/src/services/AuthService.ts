import { User, IUser } from '@/models';
import { UserRole } from '@/types';
import { JwtUtil, TokenPair, TokenPayload } from '@/utils/jwt';
import { UserService } from './UserService';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: IUser;
  tokens: TokenPair;
}

export interface RefreshTokenData {
  refreshToken: string;
}

/**
 * Authentication service for handling auth-related business logic
 */
export class AuthService {
  /**
   * Register a new user
   */
  static async register(registerData: RegisterData): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await UserService.findUserByEmail(registerData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const user = await UserService.createUser({
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        role: registerData.role || UserRole.PATIENT,
      });

      // Generate tokens
      const tokenPayload: TokenPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      };

      const tokens = JwtUtil.generateTokenPair(tokenPayload);

      // Update last login
      await User.findByIdAndUpdate(user._id, {
        lastLogin: new Date(),
        loginAttempts: 0,
      });

      return { user, tokens };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Registration failed: ${error.message}`);
      }
      throw new Error('Registration failed: Unknown error');
    }
  }

  /**
   * Login user
   */
  static async login(loginData: LoginData): Promise<AuthResponse> {
    try {
      // Find user with password
      const user = await UserService.findUserByEmailWithPassword(loginData.email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if account is locked
      if (user.isLocked()) {
        const lockTimeRemaining = user.lockUntil ? Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000) : 0;
        throw new Error(`Account is temporarily locked. Please try again in ${lockTimeRemaining} minutes.`);
      }

      // Check if account is active
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(loginData.password);
      if (!isPasswordValid) {
        // Increment login attempts
        await user.incrementLoginAttempts();
        const remainingAttempts = 5 - (user.loginAttempts + 1);
        if (remainingAttempts > 0) {
          throw new Error(`Invalid email or password. ${remainingAttempts} attempts remaining.`);
        }
        throw new Error('Invalid email or password');
      }

      // Generate tokens
      const tokenPayload: TokenPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      };

      const tokens = JwtUtil.generateTokenPair(tokenPayload);

      // Update last login and reset login attempts
      await User.findByIdAndUpdate(user._id, {
        lastLogin: new Date(),
        loginAttempts: 0,
        $unset: { lockUntil: 1 },
      });

      // Remove password from response
      const userResponse = user.toObject();

      return { user: userResponse as IUser, tokens };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Login failed: ${error.message}`);
      }
      throw new Error('Login failed: Unknown error');
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshTokenData: RefreshTokenData): Promise<TokenPair> {
    try {
      // Verify refresh token
      const payload = JwtUtil.verifyRefreshToken(refreshTokenData.refreshToken);

      // Check if user still exists and is active
      const user = await UserService.findUserById(payload.userId);
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      // Generate new token pair
      const tokenPayload: TokenPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      };

      return JwtUtil.generateTokenPair(tokenPayload);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Token refresh failed: ${error.message}`);
      }
      throw new Error('Token refresh failed: Unknown error');
    }
  }

  /**
   * Logout user (in a stateless JWT system, this is mainly for client-side token removal)
   */
  static async logout(userId: string): Promise<boolean> {
    try {
      // In a stateless JWT system, we don't need to do anything server-side
      // But we can update the user's last activity or add to a token blacklist if needed
      
      // For now, just verify the user exists
      const user = await UserService.findUserById(userId);
      return !!user;
    } catch (error) {
      return false;
    }
  }

  /**
   * Change password
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    try {
      // Find user with password
      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Validate new password strength
      if (newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long');
      }

      // Check if new password is same as current
      const isSamePassword = await user.comparePassword(newPassword);
      if (isSamePassword) {
        throw new Error('New password must be different from current password');
      }

      // Update password
      return await UserService.updatePassword(userId, newPassword);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Password change failed: ${error.message}`);
      }
      throw new Error('Password change failed: Unknown error');
    }
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(email: string): Promise<string> {
    try {
      const user = await UserService.findUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        throw new Error('If the email exists, a password reset link has been sent');
      }

      // Generate reset token
      const resetToken = user.generatePasswordResetToken();
      await user.save();

      return resetToken;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Password reset request failed: ${error.message}`);
      }
      throw new Error('Password reset request failed: Unknown error');
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() },
      });

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      // Update password and clear reset token
      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.loginAttempts = 0;
      user.lockUntil = undefined;

      await user.save();
      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Password reset failed: ${error.message}`);
      }
      throw new Error('Password reset failed: Unknown error');
    }
  }

  /**
   * Verify email with token
   */
  static async verifyEmail(token: string): Promise<boolean> {
    try {
      const user = await User.findOne({
        emailVerificationToken: token,
      });

      if (!user) {
        throw new Error('Invalid verification token');
      }

      // Update email verification status
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;

      await user.save();
      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Email verification failed: ${error.message}`);
      }
      throw new Error('Email verification failed: Unknown error');
    }
  }

  /**
   * Get user profile from token
   */
  static async getProfile(userId: string): Promise<IUser | null> {
    try {
      return await UserService.findUserById(userId);
    } catch (error) {
      return null;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updateData: {
    name?: string;
    phone?: string;
    specialization?: string;
    licenseNumber?: string;
    avatar?: string;
  }): Promise<IUser | null> {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Profile update failed: ${error.message}`);
      }
      throw new Error('Profile update failed: Unknown error');
    }
  }

  /**
   * Get user settings (placeholder - returns default settings)
   */
  static async getSettings(userId: string): Promise<any> {
    try {
      // For now, return default settings
      // In a real app, you'd have a Settings model
      return {
        id: `settings-${userId}`,
        userId,
        notifications: {
          email: true,
          push: true,
          sms: false,
          appointmentReminders: true,
          medicationReminders: true,
          healthTips: true
        },
        appointmentReminders: {
          enabled: true,
          timing: ['1day', '1hour']
        },
        accessibility: {
          fontSize: 'medium',
          highContrast: false,
          screenReader: false
        },
        privacy: {
          profileVisibility: 'private',
          shareDataForResearch: false,
          allowMarketing: false
        },
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get settings: ${error.message}`);
      }
      throw new Error('Failed to get settings: Unknown error');
    }
  }

  /**
   * Update user settings (placeholder - just returns updated settings)
   */
  static async updateSettings(userId: string, settingsData: any): Promise<any> {
    try {
      // For now, just return the updated settings
      // In a real app, you'd save to a Settings model
      return {
        id: `settings-${userId}`,
        userId,
        ...settingsData,
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update settings: ${error.message}`);
      }
      throw new Error('Failed to update settings: Unknown error');
    }
  }
}