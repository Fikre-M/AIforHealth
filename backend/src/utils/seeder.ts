import { database } from '@/config/database';
import { isDevelopment } from '@/config/env';
import { User, Appointment, AppointmentStatus, AppointmentType } from '@/models';
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

      // Seed users first
      const users = await this.seedUsers();
      
      // Seed appointments
      await this.seedAppointments(users);

      console.log('✅ Database seeding completed successfully');
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  /**
   * Seed users
   */
  private async seedUsers(): Promise<any> {
    console.log('👥 Seeding users...');

    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('👥 Users already exist, returning existing users');
      const users = await User.find({});
      return {
        admin: users.find(u => u.role === UserRole.ADMIN),
        doctor: users.find(u => u.role === UserRole.DOCTOR),
        patient: users.find(u => u.role === UserRole.PATIENT)
      };
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

    const createdUsers = [];
    for (const userData of users) {
      const user = new User(userData);
      await user.save(); // This will trigger the pre-save middleware to hash the password
      createdUsers.push(user);
    }
    console.log(`✅ Created ${users.length} users`);

    return {
      admin: createdUsers.find(u => u.role === UserRole.ADMIN),
      doctor: createdUsers.find(u => u.role === UserRole.DOCTOR),
      patient: createdUsers.find(u => u.role === UserRole.PATIENT)
    };
  }

  /**
   * Generate a unique confirmation number
   */
  private generateConfirmationNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `APT-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Seed appointments
   */
  private async seedAppointments(users: any): Promise<void> {
    console.log('📅 Seeding appointments...');

    const existingAppointments = await Appointment.countDocuments();
    if (existingAppointments > 0) {
      console.log('📅 Appointments already exist, skipping appointment seeding');
      return;
    }

    if (!users.doctor || !users.patient) {
      console.log('⚠️ Missing doctor or patient users, skipping appointment seeding');
      return;
    }

    const now = new Date();
    
    // Create future appointments first
    const futureAppointments = [
      {
        patient: users.patient._id,
        doctor: users.doctor._id,
        appointmentDate: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
        duration: 30,
        type: AppointmentType.CONSULTATION,
        status: AppointmentStatus.SCHEDULED,
        reason: 'Regular checkup and consultation',
        symptoms: ['headache', 'fatigue'],
        notes: 'Patient reports mild symptoms',
        isEmergency: false,
        confirmationNumber: this.generateConfirmationNumber(),
      },
      {
        patient: users.patient._id,
        doctor: users.doctor._id,
        appointmentDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // Next week
        duration: 45,
        type: AppointmentType.FOLLOW_UP,
        status: AppointmentStatus.SCHEDULED,
        reason: 'Follow-up appointment for previous consultation',
        notes: 'Follow-up to check progress',
        isEmergency: false,
        confirmationNumber: this.generateConfirmationNumber(),
      },
    ];

    await Appointment.insertMany(futureAppointments);

    // Create past appointment manually (bypass validation)
    const pastAppointment = new Appointment({
      patient: users.patient._id,
      doctor: users.doctor._id,
      appointmentDate: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Yesterday
      duration: 30,
      type: AppointmentType.CONSULTATION,
      status: AppointmentStatus.COMPLETED,
      reason: 'Completed consultation',
      doctorNotes: 'Patient is in good health. Recommended regular exercise.',
      prescription: 'Vitamin D supplements, 1000 IU daily',
      diagnosis: 'Mild vitamin D deficiency',
      isEmergency: false,
      confirmationNumber: this.generateConfirmationNumber(),
    });

    // Save without validation for past appointment
    await pastAppointment.save({ validateBeforeSave: false });

    console.log(`✅ Created ${futureAppointments.length + 1} appointments`);
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
      
      // Clear appointments first (due to references)
      await Appointment.deleteMany({});
      console.log('✅ Cleared appointments');

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