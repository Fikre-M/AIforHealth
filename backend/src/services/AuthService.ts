import { User, IUser } from '@/models';
import { UserRole } from '@/types';
import { JwtUtil, TokenPair, TokenPayload } from '@/utils/jwt';
import { UserService } from './UserService';

/* =========================================================
   Interfaces
========================================================= */

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

export interface UserSettings {
  id: string;
  userId: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    appointmentReminders: boolean;
    medicationReminders: boolean;
    healthTips: boolean;
  };
  appointmentReminders: {
    enabled: boolean;
    timing: string[];
  };
  accessibility: {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    screenReader: boolean;
  };
  privacy: {
    profileVisibility: 'private' | 'public';
    shareDataForResearch: boolean;
    allowMarketing: boolean;
  };
  updatedAt: string;
}

/* =========================================================
   Auth Service
========================================================= */

export class AuthService {
  /* ================= REGISTER ================= */

  static async register(data: RegisterData): Promise<AuthResponse> {
    const existingUser = await UserService.findUserByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const user = await UserService.createUser({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role ?? UserRole.PATIENT,
    });

    const payload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const tokens = JwtUtil.generateTokenPair(payload);

    await User.findByIdAndUpdate(user._id, {
      lastLogin: new Date(),
      loginAttempts: 0,
    });

    return { user, tokens };
  }

  /* ================= LOGIN ================= */

  static async login(data: LoginData): Promise<AuthResponse> {
    const user = await UserService.findUserByEmailWithPassword(data.email);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (await this.isAccountLocked(user._id.toString())) {
      throw new Error('Account is temporarily locked');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    const valid = await user.comparePassword(data.password);
    if (!valid) {
      await user.incrementLoginAttempts();
      throw new Error('Invalid email or password');
    }

    const payload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const tokens = JwtUtil.generateTokenPair(payload);

    await User.findByIdAndUpdate(user._id, {
      lastLogin: new Date(),
      loginAttempts: 0,
      $unset: { lockUntil: 1 },
    });

    return {
      user: user.toObject() as IUser,
      tokens,
    };
  }

  /* ================= REFRESH TOKEN ================= */

  static async refreshToken(data: RefreshTokenData): Promise<TokenPair> {
    const payload = JwtUtil.verifyRefreshToken(data.refreshToken);

    const user = await UserService.findUserById(payload.userId);
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    const newPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    return JwtUtil.generateTokenPair(newPayload);
  }

  /* ================= LOGOUT ================= */

  static async logout(userId: string): Promise<void> {
    const user = await UserService.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Stateless JWT — no DB action required
    return;
  }

  /* ================= CHANGE PASSWORD ================= */

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findById(userId).select('+password');
    if (!user) throw new Error('User not found');

    const valid = await user.comparePassword(currentPassword);
    if (!valid) throw new Error('Current password is incorrect');

    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long');
    }

    const same = await user.comparePassword(newPassword);
    if (same) {
      throw new Error('New password must be different');
    }

    await UserService.updatePassword(userId, newPassword);
  }

  /* ================= PASSWORD RESET ================= */

  static async requestPasswordReset(email: string): Promise<string> {
    const user = await UserService.findUserByEmail(email);
    if (!user) {
      return 'If the email exists, a password reset link has been sent';
    }

    const token = user.generatePasswordResetToken();
    await user.save();

    return token;
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) throw new Error('Invalid or expired reset token');

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;

    await user.save();
  }

  /* ================= EMAIL VERIFY ================= */

  static async verifyEmail(token: string): Promise<void> {
    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) throw new Error('Invalid verification token');

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;

    await user.save();
  }

  /* ================= ACCOUNT LOCK HELPERS ================= */

  static async isAccountLocked(userId: string): Promise<boolean> {
    const user = await User.findById(userId);
    if (!user) return false;

    return !!(user.lockUntil && user.lockUntil.getTime() > Date.now());
  }

  static async unlockAccount(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      loginAttempts: 0,
      $unset: { lockUntil: 1 },
    });
  }

  static async getLoginHistory(userId: string): Promise<Date[]> {
    const user = await User.findById(userId).select('lastLogin');
    if (!user || !user.lastLogin) return [];

    return [user.lastLogin];
  }

  /* ================= PROFILE ================= */

  static async getProfile(userId: string): Promise<IUser | null> {
    return UserService.findUserById(userId);
  }

  static async updateProfile(
    userId: string,
    updateData: Partial<Pick<IUser, 'name' | 'phone' | 'avatar'>>
  ): Promise<IUser | null> {
    return User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });
  }

  /* ================= SETTINGS ================= */

  static async getSettings(userId: string): Promise<UserSettings> {
    return {
      id: `settings-${userId}`,
      userId,
      notifications: {
        email: true,
        push: true,
        sms: false,
        appointmentReminders: true,
        medicationReminders: true,
        healthTips: true,
      },
      appointmentReminders: {
        enabled: true,
        timing: ['1day', '1hour'],
      },
      accessibility: {
        fontSize: 'medium',
        highContrast: false,
        screenReader: false,
      },
      privacy: {
        profileVisibility: 'private',
        shareDataForResearch: false,
        allowMarketing: false,
      },
      updatedAt: new Date().toISOString(),
    };
  }

  static async updateSettings(
    userId: string,
    settingsData: Partial<UserSettings>
  ): Promise<UserSettings> {
    return {
      ...(await this.getSettings(userId)),
      ...settingsData,
      updatedAt: new Date().toISOString(),
    };
  }
}
