import { UserService } from '../UserService';
import { User } from '@/models';
import { UserRole } from '@/types';
import { generateObjectId } from '@/test/helpers';

describe('UserService', () => {
  describe('createUser', () => {
    it('should create user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT
      };

      const user = await UserService.createUser(userData);

      expect(user).toBeDefined();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email.toLowerCase());
      expect(user.role).toBe(UserRole.PATIENT);
      expect(user.isActive).toBe(true);
      expect(user.password).not.toBe(userData.password); // Should be hashed
    });

    it('should reject duplicate email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'duplicate@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT
      };

      await UserService.createUser(userData);

      await expect(
        UserService.createUser(userData)
      ).rejects.toThrow('User with this email already exists');
    });

    it('should create user with default patient role', async () => {
      const userData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123!'
      };

      const user = await UserService.createUser(userData);

      expect(user.role).toBe(UserRole.PATIENT);
    });
  });

  describe('findUserById', () => {
    it('should find user by id', async () => {
      const created = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT
      });

      const found = await UserService.findUserById(created._id.toString());

      expect(found).toBeDefined();
      expect(found?._id.toString()).toBe(created._id.toString());
      expect(found?.email).toBe('test@example.com');
    });

    it('should return null for non-existent id', async () => {
      const fakeId = generateObjectId();
      const found = await UserService.findUserById(fakeId);

      expect(found).toBeNull();
    });

    it('should throw error for invalid id format', async () => {
      await expect(
        UserService.findUserById('invalid-id')
      ).rejects.toThrow('Invalid user ID format');
    });
  });

  describe('findUserByEmail', () => {
    it('should find user by email', async () => {
      await User.create({
        name: 'Test User',
        email: 'findme@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT
      });

      const found = await UserService.findUserByEmail('findme@example.com');

      expect(found).toBeDefined();
      expect(found?.email).toBe('findme@example.com');
    });

    it('should be case insensitive', async () => {
      await User.create({
        name: 'Test User',
        email: 'case@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT
      });

      const found = await UserService.findUserByEmail('CASE@EXAMPLE.COM');

      expect(found).toBeDefined();
      expect(found?.email).toBe('case@example.com');
    });

    it('should return null for non-existent email', async () => {
      const found = await UserService.findUserByEmail('notfound@example.com');

      expect(found).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user fields', async () => {
      const user = await User.create({
        name: 'Original Name',
        email: 'update@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT
      });

      const updated = await UserService.updateUser(user._id.toString(), {
        name: 'Updated Name'
      });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.email).toBe('update@example.com');
    });

    it('should reject duplicate email on update', async () => {
      await User.create({
        name: 'User 1',
        email: 'user1@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT
      });

      const user2 = await User.create({
        name: 'User 2',
        email: 'user2@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT
      });

      await expect(
        UserService.updateUser(user2._id.toString(), {
          email: 'user1@example.com'
        })
      ).rejects.toThrow('User with this email already exists');
    });

    it('should throw error for invalid id', async () => {
      await expect(
        UserService.updateUser('invalid-id', { name: 'Test' })
      ).rejects.toThrow('Invalid user ID format');
    });
  });

  describe('deleteUser', () => {
    it('should soft delete user', async () => {
      const user = await User.create({
        name: 'Delete Me',
        email: 'delete@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT
      });

      const result = await UserService.deleteUser(user._id.toString());

      expect(result).toBe(true);

      const deleted = await User.findById(user._id);
      expect(deleted?.isActive).toBe(false);
    });

    it('should throw error for invalid id', async () => {
      await expect(
        UserService.deleteUser('invalid-id')
      ).rejects.toThrow('Invalid user ID format');
    });
  });

  describe('getUsers', () => {
    beforeEach(async () => {
      await User.create({
        name: 'Patient 1',
        email: 'patient1@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT
      });
      await User.create({
        name: 'Patient 2',
        email: 'patient2@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT
      });
      await User.create({
        name: 'Doctor 1',
        email: 'doctor1@example.com',
        password: 'Password123!',
        role: UserRole.DOCTOR
      });
    });

    it('should return paginated users', async () => {
      const result = await UserService.getUsers({
        page: 1,
        limit: 10
      });

      expect(result.users).toBeDefined();
      expect(result.users.length).toBeGreaterThanOrEqual(3);
      expect(result.pagination.total).toBeGreaterThanOrEqual(3);
    });

    it('should filter by role', async () => {
      const result = await UserService.getUsers({
        role: UserRole.DOCTOR,
        page: 1,
        limit: 10
      });

      expect(result.users.length).toBeGreaterThanOrEqual(1);
      result.users.forEach(user => {
        expect(user.role).toBe(UserRole.DOCTOR);
      });
    });

    it('should filter by active status', async () => {
      const result = await UserService.getUsers({
        isActive: true,
        page: 1,
        limit: 10
      });

      result.users.forEach(user => {
        expect(user.isActive).toBe(true);
      });
    });

    it('should search by name or email', async () => {
      const result = await UserService.getUsers({
        search: 'patient1',
        page: 1,
        limit: 10
      });

      expect(result.users.length).toBeGreaterThanOrEqual(1);
      expect(result.users[0].email).toContain('patient1');
    });

    it('should handle pagination', async () => {
      const page1 = await UserService.getUsers({
        page: 1,
        limit: 2
      });

      expect(page1.users.length).toBeLessThanOrEqual(2);
      expect(page1.pagination.page).toBe(1);
      expect(page1.pagination.limit).toBe(2);
    });
  });

  describe('updatePassword', () => {
    it('should update user password', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'password@example.com',
        password: 'OldPassword123!',
        role: UserRole.PATIENT
      });

      const result = await UserService.updatePassword(
        user._id.toString(),
        'NewPassword123!'
      );

      expect(result).toBe(true);

      const updated = await User.findById(user._id).select('+password');
      const isMatch = await updated?.comparePassword('NewPassword123!');
      expect(isMatch).toBe(true);
    });

    it('should throw error for non-existent user', async () => {
      const fakeId = generateObjectId();

      await expect(
        UserService.updatePassword(fakeId, 'NewPassword123!')
      ).rejects.toThrow('User not found');
    });
  });

  describe('verifyEmail', () => {
    it('should verify user email', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'verify@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT,
        isEmailVerified: false
      });

      const result = await UserService.verifyEmail(user._id.toString());

      expect(result).toBe(true);

      const verified = await User.findById(user._id);
      expect(verified?.isEmailVerified).toBe(true);
    });
  });

  describe('getUserStats', () => {
    beforeEach(async () => {
      await User.create({
        name: 'Active Patient',
        email: 'active@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT,
        isActive: true,
        isEmailVerified: true
      });
      await User.create({
        name: 'Inactive Patient',
        email: 'inactive@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT,
        isActive: false
      });
      await User.create({
        name: 'Doctor',
        email: 'doc@example.com',
        password: 'Password123!',
        role: UserRole.DOCTOR,
        isActive: true,
        isEmailVerified: true
      });
    });

    it('should return user statistics', async () => {
      const stats = await UserService.getUserStats();

      expect(stats).toBeDefined();
      expect(stats.totalUsers).toBeGreaterThanOrEqual(3);
      expect(stats.activeUsers).toBeGreaterThanOrEqual(2);
      expect(stats.patientCount).toBeGreaterThanOrEqual(2);
      expect(stats.doctorCount).toBeGreaterThanOrEqual(1);
    });
  });
});
