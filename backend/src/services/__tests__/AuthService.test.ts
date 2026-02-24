import { AuthService } from '../AuthService';
import { User } from '@/models';
import { UserRole } from '@/types';
import { JwtUtil } from '@/utils/jwt';
import { generateObjectId } from '@/test/helpers';

describe('AuthService', () => {
  describe('register', () => {
    it('should register new user', async () => {
      const registerData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT,
      };

      const result = await AuthService.register(registerData);

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.tokens).toBeDefined();
      expect(result.user.email).toBe('newuser@example.com');
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
    });

    it('should not register duplicate email', async () => {
      const registerData = {
        name: 'Duplicate User',
        email: 'duplicate@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT,
      };

      await AuthService.register(registerData);

      await expect(
        AuthService.register(registerData)
      ).rejects.toThrow(/already exists/i);
    });

    it('should default to patient role', async () => {
      const registerData = {
        name: 'Default Role',
        email: 'defaultrole@example.com',
        password: 'Password123!',
      };

      const result = await AuthService.register(registerData);

      expect(result.user.role).toBe(UserRole.PATIENT);
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await User.create({
        name: 'Login User',
        email: 'login@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT,
        isActive: true,
      });
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'Password123!',
      };

      const result = await AuthService.login(loginData);

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.tokens).toBeDefined();
      expect(result.user.email).toBe('login@example.com');
    });

    it('should not login with wrong password', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'WrongPassword123!',
      };

      await expect(
        AuthService.login(loginData)
      ).rejects.toThrow(/Invalid email or password/i);
    });

    it('should not login with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };

      await expect(
        AuthService.login(loginData)
      ).rejects.toThrow(/Invalid email or password/i);
    });

    it('should not login with inactive account', async () => {
      await User.create({
        name: 'Inactive User',
        email: 'inactive@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT,
        isActive: false,
      });

      const loginData = {
        email: 'inactive@example.com',
        password: 'Password123!',
      };

      await expect(
        AuthService.login(loginData)
      ).rejects.toThrow(/deactivated/i);
    });

    it('should reset login attempts on successful login', async () => {
      const user = await User.findOne({ email: 'login@example.com' });
      if (user) {
        user.loginAttempts = 3;
        await user.save();
      }

      await AuthService.login({
        email: 'login@example.com',
        password: 'Password123!',
      });

      const updatedUser = await User.findOne({ email: 'login@example.com' });
      expect(updatedUser?.loginAttempts).toBe(0);
    });

    it('should increment login attempts on failed login', async () => {
      const user = await User.findOne({ email: 'login@example.com' });
      const initialAttempts = user?.loginAttempts || 0;

      try {
        await AuthService.login({
          email: 'login@example.com',
          password: 'WrongPassword!',
        });
      } catch (error) {
        // Expected to fail
      }

      const updatedUser = await User.findOne({ email: 'login@example.com' });
      expect(updatedUser?.loginAttempts).toBe(initialAttempts + 1);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token with valid refresh token', async () => {
      const user = await User.create({
        name: 'Refresh User',
        email: 'refresh@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT,
      });

      const tokens = JwtUtil.generateTokenPair({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      const newTokens = await AuthService.refreshToken({
        refreshToken: tokens.refreshToken,
      });

      expect(newTokens).toBeDefined();
      expect(newTokens.accessToken).toBeDefined();
      expect(newTokens.refreshToken).toBeDefined();
      expect(newTokens.accessToken).not.toBe(tokens.accessToken);
    });

    it('should reject invalid refresh token', async () => {
      await expect(
        AuthService.refreshToken({ refreshToken: 'invalid-token' })
      ).rejects.toThrow();
    });

    it('should reject refresh token for inactive user', async () => {
      const user = await User.create({
        name: 'Inactive Refresh',
        email: 'inactiverefresh@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT,
        isActive: false,
      });

      const tokens = JwtUtil.generateTokenPair({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      await expect(
        AuthService.refreshToken({ refreshToken: tokens.refreshToken })
      ).rejects.toThrow(/inactive/i);
    });
  });

  describe('changePassword', () => {
    it('should change password with valid current password', async () => {
      const user = await User.create({
        name: 'Change Password User',
        email: 'changepass@example.com',
        password: 'OldPassword123!',
        role: UserRole.PATIENT,
      });

      const result = await AuthService.changePassword(
        user._id.toString(),
        'OldPassword123!',
        'NewPassword123!'
      );

      expect(result).toBe(true);

      const updatedUser = await User.findById(user._id).select('+password');
      const isValid = await updatedUser?.comparePassword('NewPassword123!');
      expect(isValid).toBe(true);
    });

    it('should not change password with wrong current password', async () => {
      const user = await User.create({
        name: 'Wrong Password User',
        email: 'wrongpass@example.com',
        password: 'CurrentPassword123!',
        role: UserRole.PATIENT,
      });

      await expect(
        AuthService.changePassword(
          user._id.toString(),
          'WrongPassword123!',
          'NewPassword123!'
        )
      ).rejects.toThrow(/incorrect/i);
    });

    it('should not allow weak passwords', async () => {
      const user = await User.create({
        name: 'Weak Password User',
        email: 'weakpass@example.com',
        password: 'CurrentPassword123!',
        role: UserRole.PATIENT,
      });

      await expect(
        AuthService.changePassword(
          user._id.toString(),
          'CurrentPassword123!',
          'weak'
        )
      ).rejects.toThrow(/at least 8 characters/i);
    });

    it('should not allow reusing current password', async () => {
      const user = await User.create({
        name: 'Reuse Password User',
        email: 'reusepass@example.com',
        password: 'SamePassword123!',
        role: UserRole.PATIENT,
      });

      await expect(
        AuthService.changePassword(
          user._id.toString(),
          'SamePassword123!',
          'SamePassword123!'
        )
      ).rejects.toThrow(/different from current/i);
    });
  });

  describe('requestPasswordReset', () => {
    it('should generate reset token for valid email', async () => {
      await User.create({
        name: 'Reset User',
        email: 'reset@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT,
      });

      const token = await AuthService.requestPasswordReset('reset@example.com');

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const user = await User.findOne({ email: 'reset@example.com' });
      expect(user?.passwordResetToken).toBeDefined();
      expect(user?.passwordResetExpires).toBeDefined();
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const user = await User.create({
        name: 'Reset Password User',
        email: 'resetpassword@example.com',
        password: 'OldPassword123!',
        role: UserRole.PATIENT,
      });

      const token = user.generatePasswordResetToken();
      await user.save();

      const result = await AuthService.resetPassword(token, 'NewPassword123!');

      expect(result).toBe(true);

      const updatedUser = await User.findById(user._id).select('+password');
      const isValid = await updatedUser?.comparePassword('NewPassword123!');
      expect(isValid).toBe(true);
      expect(updatedUser?.passwordResetToken).toBeUndefined();
    });

    it('should reject invalid reset token', async () => {
      await expect(
        AuthService.resetPassword('invalid-token', 'NewPassword123!')
      ).rejects.toThrow(/Invalid or expired/i);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      const user = await User.create({
        name: 'Verify User',
        email: 'verify@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT,
        isEmailVerified: false,
        emailVerificationToken: 'valid-token',
      });

      const result = await AuthService.verifyEmail('valid-token');

      expect(result).toBe(true);

      const verifiedUser = await User.findById(user._id);
      expect(verifiedUser?.isEmailVerified).toBe(true);
      expect(verifiedUser?.emailVerificationToken).toBeUndefined();
    });

    it('should reject invalid verification token', async () => {
      await expect(
        AuthService.verifyEmail('invalid-token')
      ).rejects.toThrow(/Invalid verification token/i);
    });
  });

  describe('getProfile', () => {
    it('should get user profile', async () => {
      const user = await User.create({
        name: 'Profile User',
        email: 'profile@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT,
      });

      const profile = await AuthService.getProfile(user._id.toString());

      expect(profile).toBeDefined();
      expect(profile?.email).toBe('profile@example.com');
      expect(profile?.name).toBe('Profile User');
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      const user = await User.create({
        name: 'Logout User',
        email: 'logout@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT,
      });

      const result = await AuthService.logout(user._id.toString());

      expect(result).toBe(true);
    });
  });
});
