import { UserService } from '../UserService';
import { User } from '@/models';
import { generateObjectId } from '@/test/helpers';

describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'Password123!',
        role: 'patient' as const,
      };

      const user = await UserService.createUser(userData);

      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.role).toBe(userData.role);
    });

    it('should reject duplicate email', async () => {
      const userData = {
        name: 'Duplicate User',
        email: 'duplicate@example.com',
        password: 'Password123!',
        role: 'patient' as const,
      };

      await UserService.createUser(userData);

      await expect(UserService.createUser(userData)).rejects.toThrow();
    });
  });

  describe('findUserById', () => {
    it('should find user by id', async () => {
      const created = await UserService.createUser({
        name: 'Find User',
        email: 'find@example.com',
        password: 'Password123!',
        role: 'patient',
      });

      const found = await UserService.findUserById(created._id.toString());

      expect(found).toBeDefined();
      expect(found?._id.toString()).toBe(created._id.toString());
      expect(found?.email).toBe(created.email);
    });

    it('should return null for non-existent id', async () => {
      const fakeId = generateObjectId();
      const found = await UserService.findUserById(fakeId);

      expect(found).toBeNull();
    });
  });

  describe('findUserByEmail', () => {
    it('should find user by email', async () => {
      await UserService.createUser({
        name: 'Email User',
        email: 'email@example.com',
        password: 'Password123!',
        role: 'patient',
      });

      const found = await UserService.findUserByEmail('email@example.com');

      expect(found).toBeDefined();
      expect(found?.email).toBe('email@example.com');
    });

    it('should return null for non-existent email', async () => {
      const found = await UserService.findUserByEmail('nonexistent@example.com');

      expect(found).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user fields', async () => {
      const user = await UserService.createUser({
        name: 'Update User',
        email: 'update@example.com',
        password: 'Password123!',
        role: 'patient',
      });

      const updated = await UserService.updateUser(user._id.toString(), {
        name: 'Updated Name',
        phone: '123-456-7890',
      });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.phone).toBe('123-456-7890');
    });

    it('should return null for non-existent user', async () => {
      const fakeId = generateObjectId();
      const updated = await UserService.updateUser(fakeId, { name: 'Test' });

      expect(updated).toBeNull();
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      const user = await UserService.createUser({
        name: 'Delete User',
        email: 'delete@example.com',
        password: 'Password123!',
        role: 'patient',
      });

      const deleted = await UserService.deleteUser(user._id.toString());

      expect(deleted).toBe(true);

      const found = await UserService.findUserById(user._id.toString());
      expect(found).toBeNull();
    });

    it('should return false for non-existent user', async () => {
      const fakeId = generateObjectId();
      const deleted = await UserService.deleteUser(fakeId);

      expect(deleted).toBe(false);
    });
  });

  describe('getUsers', () => {
    beforeEach(async () => {
      // Create multiple users
      await UserService.createUser({
        name: 'User 1',
        email: 'user1@example.com',
        password: 'Password123!',
        role: 'patient',
      });
      await UserService.createUser({
        name: 'User 2',
        email: 'user2@example.com',
        password: 'Password123!',
        role: 'doctor',
      });
    });

    it('should return paginated users', async () => {
      const result = await UserService.getUsers({ page: 1, limit: 10 });

      expect(result.users).toBeDefined();
      expect(result.users.length).toBeGreaterThan(0);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.total).toBeGreaterThan(0);
    });

    it('should filter by role', async () => {
      const result = await UserService.getUsers({
        page: 1,
        limit: 10,
        role: 'doctor',
      });

      expect(result.users.every((u) => u.role === 'doctor')).toBe(true);
    });
  });
});
