import { AuthService } from '../AuthService';
import { User } from '@/models';
import { generateObjectId } from '@/test/helpers';

describe('AuthService', () => {
  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test123!',
        role: 'patient' as const,
      };

      const result = await AuthService.register(userData);

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(userData.email);
      expect(result.user.name).toBe(userData.name);
      expect(result.tokens).toBeDefined();
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'duplicate@example.com',
        password: 'Test123!',
        role: 'patient' as const,
      };

      await AuthService.register(userData);

      await expect(AuthService.register(userData)).rejects.toThrow(
        'User with this email already exists'
      );
    });

    it('should hash password before saving', async () => {
      const userData = {
        name: 'Test User',
        email: 'hash@example.com',
        password: 'PlainPassword123!',
        role: 'patient' as const,
      };

      const result = await AuthService.register(userData);
      const user = await User.findById(result.user._id).select('+password');

      expect(user?.password).toBeDefined();
      expect(user?.password).not.toBe(userData.password);
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await AuthService.register({
        name: 'Login Test',
        email: 'login@example.com',
        password: 'Test123!',
        role: 'patient',
      });
    });

    it('should login with valid credentials', async () => {
      const result = await AuthService.login({
        email: 'login@example.com',
        password: 'Test123!',
      });

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('login@example.com');
      expect(result.tokens).toBeDefined();
    });

    it('should reject invalid email', async () => {
      await expect(
        AuthService.login({
          email: 'nonexistent@example.com',
          password: 'Test123!',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should reject invalid password', async () => {
      await expect(
        AuthService.login({
          email: 'login@example.com',
          password: 'WrongPassword!',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should reject inactive account', async () => {
      const user = await User.findOne({ email: 'login@example.com' });
      if (user) {
        user.isActive = false;
        await user.save();
      }

      await expect(
        AuthService.login({
          email: 'login@example.com',
          password: 'Test123!',
        })
      ).rejects.toThrow('Account is deactivated');
    });
  });

  describe('changePassword', () => {
    let userId: string;

    beforeEach(async () => {
      const result = await AuthService.register({
        name: 'Password Test',
        email: 'password@example.com',
        password: 'OldPassword123!',
        role: 'patient',
      });
      userId = result.user._id.toString();
    });

    it('should change password with valid current password', async () => {
      const success = await AuthService.changePassword(
        userId,
        'OldPassword123!',
        'NewPassword123!'
      );

      expect(success).toBe(true);

      // Verify can login with new password
      const result = await AuthService.login({
        email: 'password@example.com',
        password: 'NewPassword123!',
      });
      expect(result.user).toBeDefined();
    });

    it('should reject incorrect current password', async () => {
      await expect(
        AuthService.changePassword(userId, 'WrongPassword!', 'NewPassword123!')
      ).rejects.toThrow('Current password is incorrect');
    });
  });

  describe('refreshToken', () => {
    it('should generate new tokens with valid refresh token', async () => {
      const registerResult = await AuthService.register({
        name: 'Refresh Test',
        email: 'refresh@example.com',
        password: 'Test123!',
        role: 'patient',
      });

      const tokens = await AuthService.refreshToken({
        refreshToken: registerResult.tokens.refreshToken,
      });

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(tokens.accessToken).not.toBe(registerResult.tokens.accessToken);
    });

    it('should reject invalid refresh token', async () => {
      await expect(
        AuthService.refreshToken({ refreshToken: 'invalid-token' })
      ).rejects.toThrow();
    });
  });
});
