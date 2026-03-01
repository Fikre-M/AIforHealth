import { UserService } from '../UserService';
import { User } from '@/models/User';
import { UserRole } from '@/types';
import { generateObjectId } from '@/test/helpers';

describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT,
      };

      const user = await UserService.createUser(userData);

      expect(user).toBeDefined();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email.toLowerCase());
      expect(user.role).toBe(UserRole.PATIENT);
      expect(user.password).not.toBe(userData.password); // Should be hashed
    });

    it('should not create duplicate emails', async () => {
      const userData = {
        name: 'Jane Doe',
        email: 'duplicate@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT,
      };

      await UserService.createUser(userData);

      await expect(
        UserService.createUser(userData)
      ).rejects.toThrow(/already exists/i);
    });

    it('should hash password correctly', async () => {
      const userData = {
        name: 'Test User',
        email: 'hash@example.com',
        password: 'PlainPassword123!',
        role: UserRole.PATIENT,
      };

      const user = await UserService.createUser(userData);
      const userWithPassword = await User.findById(user._id).select('+password');

      expect(userWithPassword?.password).toBeDefined();
      expect(userWithPassword?.password).not.toBe(userData.password);
      expect(userWithPassword?.password as string).toMatch(/^\$2[aby]\$/);
    });

    it('should create doctor with specialization', async () => {
      const doctorData = {
        name: 'Dr. Smith',
        email: 'drsmith@example.com',
        password: 'Password123!',
        role: UserRole.DOCTOR,
        specialization: 'Cardiology',
        licenseNumber: 'LIC123456',
      };

      const doctor = await UserService.createUser(doctorData);

      expect(doctor.role).toBe(UserRole.DOCTOR);
      expect(doctor.specialization).toBe('Cardiology');
      expect(doctor.licenseNumber).toBe('LIC123456');
    });
  });

  describe('findUserById', () => {
    it('should find user by ID', async () => {
      const createdUser = await User.create({
        name: 'Find Me',
        email: 'findme@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT,
      });

      const foundUser = await UserService.findUserById(createdUser._id.toString());

      expect(foundUser).toBeDefined();
      expect(foundUser?._id.toString()).toBe(createdUser._id.toString());
      expect(foundUser?.email).toBe('findme@example.com');
    });

    it('should return null for non-existent user', async () => {
      const fakeId = generateObjectId();
      const user = await UserService.findUserById(fakeId);

      expect(user).toBeNull();
    });

    it('should throw error for invalid ID format', async () => {
      await expect(
        UserService.findUserById('invalid-id')
      ).rejects.toThrow(/Invalid user ID format/i);
    });
  });

  describe('findUserByEmail', () => {
    it('should find user by email', async () => {
      await User.create({
        name: 'Email User',
        email: 'emailuser@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT,
      });

      const user = await UserService.findUserByEmail('emailuser@example.com');

      expect(user).toBeDefined();
      expect(user?.email).toBe('emailuser@example.com');
    });

    it('should be case-insensitive', async () => {
      await User.create({
        name: 'Case Test',
        email: 'casetest@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT,
      });

      const user = await UserService.findUserByEmail('CaseTest@Example.COM');

      expect(user).toBeDefined();
      expect(user?.email).toBe('casetest@example.com');
    });
  });

  describe('updateUser', () => {
    it('should update user profile', async () => {
      const user = await User.create({
        name: 'Original Name',
        email: 'update@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT,
      });

      const updated = await UserService.updateUser(user._id.toString(), {
        name: 'Updated Name',
      });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Updated Name');
    });

    it('should not update email', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'original@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT,
      });

      const updated = await UserService.updateUser(user._id.toString(), {
        email: 'newemail@example.com',
      } as any);

      expect(updated?.email).toBe('original@example.com');
    });
  });

  describe('updatePassword', () => {
    it('should update password and hash it', async () => {
      const user = await User.create({
        name: 'Password User',
        email: 'password@example.com',
        password: 'OldPassword123!',
        role: UserRole.PATIENT,
      });

      const result = await UserService.updatePassword(
        user._id.toString(),
        'NewPassword123!'
      );

      expect(result).toBe(true);

      const updatedUser = await User.findById(user._id).select('+password');
      const isValid = await updatedUser?.comparePassword('NewPassword123!');
      expect(isValid).toBe(true);
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate user account', async () => {
      const user = await User.create({
        name: 'Active User',
        email: 'active@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT,
        isActive: true,
      });

      const updated = await UserService.updateUser(user._id.toString(), {
        isActive: false,
      });

      expect(updated?.isActive).toBe(false);
    });
  });

  describe('getUsers', () => {
    it('should get users with pagination', async () => {
      // Create multiple users
      await User.create([
        { name: 'User 1', email: 'user1@example.com', password: 'Pass123!', role: UserRole.PATIENT },
        { name: 'User 2', email: 'user2@example.com', password: 'Pass123!', role: UserRole.PATIENT },
        { name: 'User 3', email: 'user3@example.com', password: 'Pass123!', role: UserRole.PATIENT },
      ]);

      const result = await UserService.getUsers({ page: 1, limit: 2 });

      expect(result.users).toHaveLength(2);
      expect(result.pagination.total).toBeGreaterThanOrEqual(3);
      expect(result.pagination.pages).toBeGreaterThanOrEqual(2);
    });

    it('should filter by role', async () => {
      await User.create([
        { name: 'Patient', email: 'pat@example.com', password: 'Pass123!', role: UserRole.PATIENT },
        { name: 'Doctor', email: 'doc@example.com', password: 'Pass123!', role: UserRole.DOCTOR },
      ]);

      const result = await UserService.getUsers({ role: UserRole.DOCTOR });

      expect(result.users.every(u => u.role === UserRole.DOCTOR)).toBe(true);
    });
  });
});
