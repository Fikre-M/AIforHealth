import { AuthService } from '../AuthService';
import { User } from '@/models/User';
import { UserRole } from '@/types';

// Uses the global in-memory MongoDB from src/test/setup.ts
// No mocks — tests run against real service logic

describe('AuthService', () => {
  const validPassword = 'Password123!';

  describe('register', () => {
    it('should register a new user and return tokens', async () => {
      const result = await AuthService.register({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: validPassword,
      });

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('jane@example.com');
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
    });

    it('should default role to patient', async () => {
      const result = await AuthService.register({
        name: 'Patient User',
        email: 'patient@example.com',
        password: validPassword,
      });

      expect(result.user.role).toBe(UserRole.PATIENT);
    });

    it('should throw if email already exists', async () => {
      await AuthService.register({
        name: 'First',
        email: 'dup@example.com',
        password: validPassword,
      });

      await expect(
        AuthService.register({ name: 'Second', email: 'dup@example.com', password: validPassword })
      ).rejects.toThrow(/already exists/i);
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await AuthService.register({
        name: 'Login User',
        email: 'login@example.com',
        password: validPassword,
      });
    });

    it('should login with correct credentials', async () => {
      const result = await AuthService.login({
        email: 'login@example.com',
        password: validPassword,
      });

      expect(result.user.email).toBe('login@example.com');
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
    });

    it('should not expose password in response', async () => {
      const result = await AuthService.login({
        email: 'login@example.com',
        password: validPassword,
      });

      const userObj = result.user as Record<string, unknown>;
      expect(userObj['password']).toBeUndefined();
    });

    it('should throw for wrong password', async () => {
      await expect(
        AuthService.login({ email: 'login@example.com', password: 'WrongPass!' })
      ).rejects.toThrow(/invalid email or password/i);
    });

    it('should throw for non-existent email', async () => {
      await expect(
        AuthService.login({ email: 'nobody@example.com', password: validPassword })
      ).rejects.toThrow(/invalid email or password/i);
    });

    it('should throw for deactivated account', async () => {
      await User.findOneAndUpdate({ email: 'login@example.com' }, { isActive: false });

      await expect(
        AuthService.login({ email: 'login@example.com', password: validPassword })
      ).rejects.toThrow(/deactivated/i);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const { user } = await AuthService.register({
        name: 'Change Pass',
        email: 'changepass@example.com',
        password: validPassword,
      });

      await expect(
        AuthService.changePassword(user._id.toString(), validPassword, 'NewPassword456!')
      ).resolves.not.toThrow();

      // Old password should no longer work
      await expect(
        AuthService.login({ email: 'changepass@example.com', password: validPassword })
      ).rejects.toThrow();

      // New password should work
      const result = await AuthService.login({
        email: 'changepass@example.com',
        password: 'NewPassword456!',
      });
      expect(result.user).toBeDefined();
    });

    it('should throw if current password is wrong', async () => {
      const { user } = await AuthService.register({
        name: 'Wrong Pass',
        email: 'wrongpass@example.com',
        password: validPassword,
      });

      await expect(
        AuthService.changePassword(user._id.toString(), 'WrongCurrent!', 'NewPassword456!')
      ).rejects.toThrow(/current password/i);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const { user } = await AuthService.register({
        name: 'Profile User',
        email: 'profile@example.com',
        password: validPassword,
      });

      const profile = await AuthService.getProfile(user._id.toString());

      expect(profile).toBeDefined();
      expect(profile?.email).toBe('profile@example.com');
    });

    it('should return null for non-existent user', async () => {
      const { generateObjectId } = await import('@/test/helpers');
      const profile = await AuthService.getProfile(generateObjectId());
      expect(profile).toBeNull();
    });
  });

  describe('isAccountLocked', () => {
    it('should return false for a normal account', async () => {
      const { user } = await AuthService.register({
        name: 'Unlocked',
        email: 'unlocked@example.com',
        password: validPassword,
      });

      const locked = await AuthService.isAccountLocked(user._id.toString());
      expect(locked).toBe(false);
    });

    it('should return true after lockUntil is set in the future', async () => {
      const { user } = await AuthService.register({
        name: 'Locked',
        email: 'locked@example.com',
        password: validPassword,
      });

      await User.findByIdAndUpdate(user._id, {
        lockUntil: new Date(Date.now() + 60 * 60 * 1000),
      });

      const locked = await AuthService.isAccountLocked(user._id.toString());
      expect(locked).toBe(true);
    });
  });
});
