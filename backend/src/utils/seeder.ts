import { database } from '@/config/database';
import { isDevelopment } from '@/config/env';
import { User } from '@/models';
import { UserRole } from '@/types';

/**
 * Database seeder for development and testing
 */
export class DatabaseSeeder {
  private static instance: DatabaseSeeder;

  private constructor() {}

  public static getInstance(): DatabaseSeeder {
    if (!DatabaseSeeder.instance) {
      DatabaseSeeder.instance = new DatabaseSeeder();
    }
    return DatabaseSeeder.instance;
  }

  /**
   * Seed the database with initial data
   */
  public async seed(): Promise<void> {
    if (!isDevelopment) {
      console.log('⚠️ Seeding is only available in development environment');
      return;
    }

    try {
      console.log('🌱 Starting database seeding...');
      
      // Ensure database is connected
      if (!database.getConnectionStatus()) {
        await database.connect();
      }

      // Seed users
      await this.seedUsers();

      console.log('✅ Database seeding completed successfully');
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  /**
   * Seed users
   */
  private async seedUsers(): Promise<void> {
    console.log('👥 Seeding users...');

    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('👥 Users already exist, skipping user seeding');
      return;
    }

    const users = [
      {
        name: 'Admin User',
        email: 'admin@aiforhealth.com',
        password: 'Admin123!@#',
        role: UserRole.ADMIN,
        isEmailVerified: true,
      },
      {
        name: 'Dr. John Smith',
        email: 'doctor@aiforhealth.com',
        password: 'Doctor123!@#',
        role: UserRole.DOCTOR,
        isEmailVerified: true,
      },
      {
        name: 'Jane Doe',
        email: 'patient@aiforhealth.com',
        password: 'Patient123!@#',
        role: UserRole.PATIENT,
        isEmailVerified: true,
      },
    ];

    await User.insertMany(users);
    console.log(`✅ Created ${users.length} users`);
  }

  /**
   * Clear all data from the database (development only)
   */
  public async clear(): Promise<void> {
    if (!isDevelopment) {
      console.log('⚠️ Database clearing is only available in development environment');
      return;
    }

    try {
      console.log('🧹 Clearing database...');
      
      // Clear users
      await User.deleteMany({});
      console.log('✅ Cleared users');

      console.log('✅ Database cleared successfully');
    } catch (error) {
      console.error('❌ Database clearing failed:', error);
      throw error;
    }
  }

  /**
   * Reset database (clear + seed)
   */
  public async reset(): Promise<void> {
    await this.clear();
    await this.seed();
  }
}

export const seeder = DatabaseSeeder.getInstance();