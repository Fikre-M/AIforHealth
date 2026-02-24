import { AuthService } from '../AuthService';
import { User } from '@/models';
import { UserRole } from '@/types';
import { JwtUtil } from '@/utils/jwt';

describe('AuthService', () => {
  describe('register', () => {
    it('should register new user successfully', async () => {
      const registerData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT
      };

      const result = await AuthService.register(registerData);

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(registerData.email.toLowerCase());
      expect(result.user.name).toBe(registerData.name);
      expect(result.tokens).toBeDefined();
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
    });

    it('should reject duplicate email registration', async () => {
      const registerData = {
        name: 'Duplicate User',
        email: 'duplicate@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT
      };

      await AuthService.register(registerData);

      await expect(
        AuthService.register(registerData)
      ).rejects.toThrow('User with this email already exists');
    });

    it('should default to patient role if not specified', async () => {
      const registerData = {
        name: 'Default Role User',
        email: 'defaultrole@example.com',
        password: 'Password123!'
      };

      const result = await AuthService.register(registerData);

      expect(result.user.role).toBe(UserRole.PATIENT);
    });

    it('should hash password', async () => {
      const registerData = {
        name: 'Hash Test',
        email: 'hashtest@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT
      };

      const result = await AuthService.register(registerData);

      const user = await User.findById(result.user._id).select('+password');
      expect(user?.password).not.toBe(registerData.password);
      expect(user?.password).toBeDefined();
    });

    it('should update last login on registration', async () => {
      const registerData = {
        name: 'Login Test',
        email: 'logintest@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT
      };

      const result = await AuthService.register(registerData);

      const user = await User.findById(result.user._id);
      expect(user?.lastLogin).toBeDefined();
      expect(user?.loginAttempts).toBe(0);
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await AuthService.register({
        name: 'Login User',
        email: 'login@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT
      });
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'Password123!'
      };

      const result = await AuthService.login(loginData);

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(loginData.email);
      expect(result.tokens).toBeDefined();
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
    });

    it('should reject invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Password123!'
      };

      await expect(
        AuthService.login(loginData)
      ).rejects.toThrow('Invalid email or password');
    });

    it('should reject invalid password', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'WrongPassword123!'
      };

      await expect(
        AuthService.login(loginData)
      ).rejects.toThrow('Invalid email or password');
    });

    it('should increment login attempts on failed login', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'WrongPassword123!'
      };

      const user = await User.findOne({ email: 'login@example.com' });
      const initialAttempts = user?.loginAttempts || 0;

      try {
        await AuthService.login(loginData);
      } catch (error) {
        // Expected to fail
      }

      const updatedUser = await User.findOne({ email: 'login@example.com' });
      expect(updatedUser?.loginAttempts).toBe(initialAttempts + 1);
    });

    it('should reject login for inactive account', async () => {
      await User.findOneAndUpdate(
        { email: 'login@example.com' },
        { isActive: false }
      );

      const loginData = {
        email: 'login@example.com',
        password: 'Password123!'
      };

      await expect(
        AuthService.login(loginData)
      ).rejects.toThrow('Account is deactivated');
    });

    it('should reset login attempts on successful login', async () => {
      // Set some failed attempts
      await User.findOneAndUpdate(
        { email: 'login@example.com' },
        { loginAttempts: 3 }
      );

      const loginData = {
        email: 'login@example.com',
        password: 'Password123!'
      };

      await AuthService.login(loginData);

      const user = await User.findOne({ email: 'login@example.com' });
      expect(user?.loginAttempts).toBe(0);
    });

    it('should update last login timestamp', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'Password123!'
      };

      const beforeLogin = new Date();
      await AuthService.login(loginData);

      const user = await User.findOne({ email: 'login@example.com' });
      expect(user?.lastLogin).toBeDefined();
      expect(user!.lastLogin!.getTime()).toBeGreaterThanOrEqual(beforeLogin.getTime());
    });
  });

  describe('refreshToken', () => {
    let validRefreshToken: string;
    let userId: string;

    beforeEach(async () => {
      const result = await AuthService.register({
        name: 'Refresh User',
        email: 'refresh@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT
      });

      validRefreshToken = result.tokens.refreshToken;
      userId = result.user._id.toString();
    });

    it('should refresh tokens with valid refresh token', async () => {
      const newTokens = await AuthService.refreshToken({
        refreshToken: validRefreshToken
      });

      expect(newTokens).toBeDefined();
      expect(newTokens.accessToken).toBeDefined();
      expect(newTokens.refreshToken).toBeDefined();
      expect(newTokens.accessToken).not.toBe(validRefreshToken);
    });

    it('should reject invalid refresh token', async () => {
      await expect(
        AuthService.refreshToken({ refreshToken: 'invalid-token' })
      ).rejects.toThrow();
    });

    it('should reject refresh token for inactive user', async () => {
      await User.findByIdAndUpdate(userId, { isActive: false });

      await expect(
        AuthService.refreshToken({ refreshToken: validRefreshToken })
      ).rejects.toThrow('User not found or inactive');
    });

    it('should reject refresh token for deleted user', async () => {
      await User.findByIdAndDelete(userId);

      await expect(
        AuthService.refreshToken({ refreshToken: validRefreshToken })
      ).rejects.toThrow('User not found or inactive');
    });
  });

  describe('logout', () => {
    it('should logout successfully for valid user', async () => {
      const result = await AuthService.register({
        name: 'Logout User',
        email: 'logout@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT
      });

      const logoutResult = await AuthService.logout(result.user._id.toString());

      expect(logoutResult).toBe(true);
    });

    it('should return false for non-existent user', async () => {
      const logoutResult = await AuthService.logout('507f1f77bcf86cd799439011');

      expect(logoutResult).toBe(false);
    });
  });

  describe('changePassword', () => {
    let userId: string;

    beforeEach(async () => {
      const result = await AuthService.register({
        name: 'Password Change User',
        email: 'changepass@example.com',
        password: 'OldPassword123!',
        role: UserRole.PATIENT
      });

      userId = result.user._id.toString();
    });

    it('should change password with valid current password', async () => {
      const result = await AuthService.changePassword(
        userId,
        'OldPassword123!',
        'NewPassword123!'
      );

      expect(result).toBe(true);

      // Verify new password works
      const loginResult = await AuthService.login({
        email: 'changepass@example.com',
        password: 'NewPassword123!'
      });

      expect(loginResult).toBeDefined();
    });

    it('should reject change with incorrect current password', async () => {
      await expect(
        AuthService.changePassword(
          userId,
          'WrongPassword123!',
          'NewPassword123!'
        )
      ).rejects.toThrow('Current password is incorrect');
    });

    it('should reject change for non-existent user', async () => {
      await expect(
        AuthService.changePassword(
          '507f1f77bcf86cd799439011',
          'OldPassword123!',
          'NewPassword123!'
        )
      ).rejects.toThrow('User not found');
    });
  });

  describe('token validation', () => {
    it('should generate valid JWT tokens', async () => {
      const result = await AuthService.register({
        name: 'Token User',
        email: 'token@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT
      });

      const accessPayload = JwtUtil.verifyAccessToken(result.tokens.accessToken);
      expect(accessPayload).toBeDefined();
      expect(accessPayload.userId).toBe(result.user._id.toString());
      expect(accessPayload.email).toBe(result.user.email);

      const refreshPayload = JwtUtil.verifyRefreshToken(result.tokens.refreshToken);
      expect(refreshPayload).toBeDefined();
      expect(refreshPayload.userId).toBe(result.user._id.toString());
    });
  });
});
