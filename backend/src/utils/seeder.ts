import { database } from '@/config/database';
import { isDevelopment } from '@/config/env';

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

      // TODO: Add seeding logic for different models
      // await this.seedUsers();
      // await this.seedDoctors();
      // await this.seedAppointments();

      console.log('✅ Database seeding completed successfully');
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
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
      
      // Get all collections
      const collections = await database.getStats();
      
      // TODO: Drop collections when models are created
      // await User.deleteMany({});
      // await Doctor.deleteMany({});
      // await Appointment.deleteMany({});

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