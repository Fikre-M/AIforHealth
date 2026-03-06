import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { Clinic } from '../models/Clinic';
import env from '../config/env';
import { UserRole } from '../types';

async function seedDoctors() {
  try {
    // Connect to MongoDB
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all clinics
    const clinics = await Clinic.find({});
    if (clinics.length === 0) {
      console.log('No clinics found. Please run seedClinics first.');
      return;
    }

    // Clear existing doctors
    await User.deleteMany({ role: UserRole.DOCTOR });
    console.log('Cleared existing doctors');

    const sampleDoctors = [
      // City General Hospital doctors
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@citygeneral.com',
        password: await bcrypt.hash('password123', 12),
        role: UserRole.DOCTOR,
        specialization: 'Cardiology',
        phone: '+1-555-0201',
        isActive: true,
      },
      {
        name: 'Dr. Michael Chen',
        email: 'michael.chen@citygeneral.com',
        password: await bcrypt.hash('password123', 12),
        role: UserRole.DOCTOR,
        specialization: 'Emergency Medicine',
        phone: '+1-555-0202',
        isActive: true,
      },
      {
        name: 'Dr. Emily Rodriguez',
        email: 'emily.rodriguez@citygeneral.com',
        password: await bcrypt.hash('password123', 12),
        role: UserRole.DOCTOR,
        specialization: 'Pediatrics',
        phone: '+1-555-0203',
        isActive: true,
      },

      // Westside Medical Center doctors
      {
        name: 'Dr. James Wilson',
        email: 'james.wilson@westside.com',
        password: await bcrypt.hash('password123', 12),
        role: UserRole.DOCTOR,
        specialization: 'Family Medicine',
        phone: '+1-555-0204',
        isActive: true,
      },
      {
        name: 'Dr. Lisa Thompson',
        email: 'lisa.thompson@westside.com',
        password: await bcrypt.hash('password123', 12),
        role: UserRole.DOCTOR,
        specialization: 'Dermatology',
        phone: '+1-555-0205',
        isActive: true,
      },

      // Eastside Specialty Clinic doctors
      {
        name: 'Dr. Robert Kim',
        email: 'robert.kim@eastside.com',
        password: await bcrypt.hash('password123', 12),
        role: UserRole.DOCTOR,
        specialization: 'Neurology',
        phone: '+1-555-0206',
        isActive: true,
      },
      {
        name: 'Dr. Amanda Foster',
        email: 'amanda.foster@eastside.com',
        password: await bcrypt.hash('password123', 12),
        role: UserRole.DOCTOR,
        specialization: 'Psychiatry',
        phone: '+1-555-0207',
        isActive: true,
      },

      // Northside Community Health doctors
      {
        name: 'Dr. David Martinez',
        email: 'david.martinez@northside.com',
        password: await bcrypt.hash('password123', 12),
        role: UserRole.DOCTOR,
        specialization: 'Family Medicine',
        phone: '+1-555-0208',
        isActive: true,
      },
      {
        name: 'Dr. Jennifer Lee',
        email: 'jennifer.lee@northside.com',
        password: await bcrypt.hash('password123', 12),
        role: UserRole.DOCTOR,
        specialization: 'Psychiatry',
        phone: '+1-555-0209',
        isActive: true,
      },

      // Southside Urgent Care doctors
      {
        name: 'Dr. Mark Anderson',
        email: 'mark.anderson@southside.com',
        password: await bcrypt.hash('password123', 12),
        role: UserRole.DOCTOR,
        specialization: 'Urgent Care',
        phone: '+1-555-0210',
        isActive: true,
      }
    ];

    // Insert sample doctors
    const doctors = await User.insertMany(sampleDoctors);
    console.log(`Inserted ${doctors.length} sample doctors`);

    console.log('\nDoctor seeding completed successfully');
  } catch (error) {
    console.error('Error seeding doctors:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedDoctors();
}

export { seedDoctors };