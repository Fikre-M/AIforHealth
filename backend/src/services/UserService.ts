import { User, IUser } from '@/models';
import { UserRole } from '@/types';
import { DatabaseUtil } from '@/utils/database';

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
}

export interface UserQuery {
  page?: number;
  limit?: number;
  role?: UserRole;
  isActive?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * User service for handling user-related business logic
 */
export class UserService {
  /**
   * Create a new user
   */
  static async createUser(userData: CreateUserData): Promise<IUser> {
    try {
      // Create new user directly - let MongoDB unique index handle duplicates
      const user = new User(userData);
      await user.save();

      return user;
    } catch (error: any) {
      // Handle MongoDB duplicate key error (E11000)
      if (error.code === 11000 && error.keyPattern?.email) {
        throw new Error('User with this email already exists');
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to create user: ${error.message}`);
      }
      throw new Error('Failed to create user: Unknown error');
    }
  }

  /**
   * Find user by ID
   */
  static async findUserById(userId: string): Promise<IUser | null> {
    try {
      if (!DatabaseUtil.isValidObjectId(userId)) {
        throw new Error('Invalid user ID format');
      }

      return await User.findById(userId);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to find user: ${error.message}`);
      }
      throw new Error('Failed to find user: Unknown error');
    }
  }

  /**
   * Find user by email
   */
  static async findUserByEmail(email: string): Promise<IUser | null> {
    try {
      return await User.findOne({ email: email.toLowerCase() });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to find user: ${error.message}`);
      }
      throw new Error('Failed to find user: Unknown error');
    }
  }

  /**
   * Find user by email with password (for authentication)
   */
  static async findUserByEmailWithPassword(email: string): Promise<IUser | null> {
    try {
      return await (User as any).findByEmailWithPassword(email.toLowerCase());
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to find user: ${error.message}`);
      }
      throw new Error('Failed to find user: Unknown error');
    }
  }

  /**
   * Update user by ID
   */
  static async updateUser(userId: string, updateData: UpdateUserData): Promise<IUser | null> {
    try {
      if (!DatabaseUtil.isValidObjectId(userId)) {
        throw new Error('Invalid user ID format');
      }

      // If email is being updated, check for duplicates
      if (updateData.email) {
        const existingUser = await User.findOne({ 
          email: updateData.email,
          _id: { $ne: userId }
        });
        if (existingUser) {
          throw new Error('User with this email already exists');
        }
      }

      const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      );

      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update user: ${error.message}`);
      }
      throw new Error('Failed to update user: Unknown error');
    }
  }

  /**
   * Delete user by ID (soft delete by setting isActive to false)
   */
  static async deleteUser(userId: string): Promise<boolean> {
    try {
      if (!DatabaseUtil.isValidObjectId(userId)) {
        throw new Error('Invalid user ID format');
      }

      // Check for active appointments before deletion
      const Appointment = (await import('@/models')).Appointment;
      const activeAppointments = await Appointment.countDocuments({
        $or: [{ patient: userId }, { doctor: userId }],
        status: { $in: ['scheduled', 'confirmed', 'in_progress'] }
      });

      if (activeAppointments > 0) {
        throw new Error('Cannot delete user with active appointments. Please cancel or complete all appointments first.');
      }

      // Soft delete the user
      const result = await User.findByIdAndUpdate(
        userId,
        { isActive: false },
        { new: true }
      );

      // Archive all past appointments for this user
      if (result) {
        await Appointment.updateMany(
          { $or: [{ patient: userId }, { doctor: userId }] },
          { $set: { isArchived: true } }
        );
      }

      return !!result;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete user: ${error.message}`);
      }
      throw new Error('Failed to delete user: Unknown error');
    }
  }

  /**
   * Get users with pagination and filtering
   */
  static async getUsers(query: UserQuery = {}) {
    try {
      const {
        page = 1,
        limit = 20, // Default limit to prevent unbounded queries
        role,
        isActive,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = query;

      // Enforce maximum limit to prevent performance issues
      const maxLimit = 100;
      const effectiveLimit = Math.min(limit, maxLimit);

      // Build filter object
      const filter: any = {};
      
      if (role) filter.role = role;
      if (isActive !== undefined) filter.isActive = isActive;
      
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      // Build sort object
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Calculate pagination
      const skip = (page - 1) * effectiveLimit;

      // Execute queries
      const [users, total] = await Promise.all([
        User.find(filter)
          .select('-password -passwordResetToken -emailVerificationToken') // Exclude sensitive fields
          .sort(sort)
          .skip(skip)
          .limit(effectiveLimit)
          .lean(),
        User.countDocuments(filter)
      ]);

      return {
        users,
        pagination: {
          page,
          limit: effectiveLimit,
          total,
          pages: Math.ceil(total / effectiveLimit)
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get users: ${error.message}`);
      }
      throw new Error('Failed to get users: Unknown error');
    }
  }

  /**
   * Update user password
   */
  static async updatePassword(userId: string, newPassword: string): Promise<boolean> {
    try {
      if (!DatabaseUtil.isValidObjectId(userId)) {
        throw new Error('Invalid user ID format');
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      user.password = newPassword;
      await user.save();

      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update password: ${error.message}`);
      }
      throw new Error('Failed to update password: Unknown error');
    }
  }

  /**
   * Verify user email
   */
  static async verifyEmail(userId: string): Promise<boolean> {
    try {
      if (!DatabaseUtil.isValidObjectId(userId)) {
        throw new Error('Invalid user ID format');
      }

      const result = await User.findByIdAndUpdate(
        userId,
        { 
          isEmailVerified: true,
          $unset: { emailVerificationToken: 1 }
        },
        { new: true }
      );

      return !!result;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to verify email: ${error.message}`);
      }
      throw new Error('Failed to verify email: Unknown error');
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats() {
    try {
      const stats = await User.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            activeUsers: {
              $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
            },
            verifiedUsers: {
              $sum: { $cond: [{ $eq: ['$isEmailVerified', true] }, 1, 0] }
            },
            patientCount: {
              $sum: { $cond: [{ $eq: ['$role', UserRole.PATIENT] }, 1, 0] }
            },
            doctorCount: {
              $sum: { $cond: [{ $eq: ['$role', UserRole.DOCTOR] }, 1, 0] }
            },
            adminCount: {
              $sum: { $cond: [{ $eq: ['$role', UserRole.ADMIN] }, 1, 0] }
            }
          }
        }
      ]);

      return stats[0] || {
        totalUsers: 0,
        activeUsers: 0,
        verifiedUsers: 0,
        patientCount: 0,
        doctorCount: 0,
        adminCount: 0
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get user stats: ${error.message}`);
      }
      throw new Error('Failed to get user stats: Unknown error');
    }
  }
}