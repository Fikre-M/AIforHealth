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
        profile: {
          clinicId: clinics[0]._id,
          specialty: 'Cardiology',
          experience: 12,
          education: ['MD from Harvard Medical School', 'Cardiology Fellowship at Mayo Clinic'],
          languages: ['English', 'Spanish'],
          rating: 4.8,
          consultationFee: 250,
          isAvailable: true,
          bio: 'Experienced cardiologist specializing in interventional cardiology and heart disease prevention.',
        }
      },
      {
        name: 'Dr. Michael Chen',
        email: 'michael.chen@citygeneral.com',
        password: await bcrypt.hash('password123', 12),
        role: UserRole.DOCTOR,
        profile: {
          clinicId: clinics[0]._id,
          specialty: 'Emergency Medicine',
          experience: 8,
          education: ['MD from Johns Hopkins', 'Emergency Medicine Residency at UCLA'],
          languages: ['English', 'Mandarin'],
          rating: 4.6,
          consultationFee: 200,
          isAvailable: true,
          bio: 'Emergency medicine physician with expertise in trauma care and critical care medicine.',
        }
      },
      {
        name: 'Dr. Emily Rodriguez',
        email: 'emily.rodriguez@citygeneral.com',
        password: await bcrypt.hash('password123', 12),
        role: UserRole.DOCTOR,
        profile: {
          clinicId: clinics[0]._id,
          specialty: 'Pediatrics',
          experience: 10,
          education: ['MD from Stanford University', 'Pediatrics Residency at Children\'s Hospital Boston'],
          languages: ['English', 'Spanish'],
          rating: 4.9,
          consultationFee: 180,
          isAvailable: true,
          bio: 'Pediatrician dedicated to providing comprehensive care for children from infancy through adolescence.',
        }
      },

      // Westside Medical Center doctors
      {
        name: 'Dr. James Wilson',
        email: 'james.wilson@westside.com',
        password: await bcrypt.hash('password123', 12),
        role: UserRole.DOCTOR,
        profile: {
          clinicId: clinics[1]._id,
          specialty: 'Family Medicine',
          experience: 15,
          education: ['MD from University of Michigan', 'Family Medicine Residency at Cleveland Clinic'],
          languages: ['English'],
          rating: 4.5,
          consultationFee: 150,
          isAvailable: true,
          bio: 'Family physician providing comprehensive primary care for patients of all ages.',
        }
      },
      {
        name: 'Dr. Lisa Thompson',
        email: 'lisa.thompson@westside.com',
        password: await bcrypt.hash('password123', 12),
        role: UserRole.DOCTOR,
        profile: {
          clinicId: clinics[1]._id,
          specialty: 'Dermatology',
          experience: 9,
          education: ['MD from NYU School of Medicine', 'Dermatology Residency at Mount Sinai'],
          languages: ['English', 'French'],
          rating: 4.7,
          consultationFee: 220,
          isAvailable: true,
          bio: 'Dermatologist specializing in medical and cosmetic dermatology, skin cancer prevention.',
        }
      },

      // Eastside Specialty Clinic doctors
      {
        name: 'Dr. Robert Kim',
        email: 'robert.kim@eastside.com',
        password: await bcrypt.hash('password123', 12),
        role: UserRole.DOCTOR,
        profile: {
          clinicId: clinics[2]._id,
          specialty: 'Neurology',
          experience: 14,
          education: ['MD from Yale School of Medicine', 'Neurology Residency at Massachusetts General'],
          languages: ['English', 'Korean'],
          rating: 4.8,
          consultationFee: 300,
          isAvailable: true,
          bio: 'Neurologist with expertise in stroke care, epilepsy, and movement disorders.',
        }
      },
      {
        name: 'Dr. Amanda Foster',
        email: 'amanda.foster@eastside.com',
        password: await bcrypt.hash('password123', 12),
        role: UserRole.DOCTOR,
        profile: {
          clinicId: clinics[2]._id,
          specialty: 'Psychiatry',
          experience: 11,
          education: ['MD from Columbia University', 'Psychiatry Residency at Bellevue Hospital'],
          languages: ['English'],
          rating: 4.6,
          consultationFee: 280,
          isAvailable: true,
          bio: 'Psychiatrist specializing in anxiety disorders, depression, and cognitive behavioral therapy.',
        }
      },

      // Northside Community Health doctors
      {
        name: 'Dr. David Martinez',
        email: 'david.martinez@northside.com',
        password: await bcrypt.hash('password123', 12),
        role: UserRole.DOCTOR,
        profile: {
          clinicId: clinics[3]._id,
          specialty: 'Family Medicine',
          experience: 7,
          education: ['MD from University of Texas', 'Family Medicine Residency at Baylor'],
          languages: ['English', 'Spanish'],
          rating: 4.4,
          consultationFee: 140,
          isAvailable: true,
          bio: 'Community-focused family physician committed to preventive care and health education.',
        }
      },
      {
        name: 'Dr. Jennifer Lee',
        email: 'jennifer.lee@northside.com',
        password: await bcrypt.hash('password123', 12),
        role: UserRole.DOCTOR,
        profile: {
          clinicId: clinics[3]._id,
          specialty: 'Mental Health',
          experience: 6,
          education: ['MD from University of Washington', 'Psychiatry Residency at Seattle Children\'s'],
          languages: ['English', 'Korean'],
          rating: 4.5,
          consultationFee: 160,
          isAvailable: true,
          bio: 'Mental health specialist focusing on community mental health and family therapy.',
        }
      },

      // Southside Urgent Care doctors
      {
        name: 'Dr. Mark Anderson',
        email: 'mark.anderson@southside.com',
        password: await bcrypt.hash('password123', 12),
        role: UserRole.DOCTOR,
        profile: {
          clinicId: clinics[4]._id,
          specialty: 'Urgent Care',
          experience: 5,
          education: ['MD from University of Florida', 'Emergency Medicine Residency at Jackson Memorial'],
          languages: ['English'],
          rating: 4.2,
          consultationFee: 120,
          isAvailable: true,
          bio: 'Urgent care physician providing immediate care for non-life-threatening conditions.',
        }
      }
    ];

    // Insert sample doctors
    const doctors = await User.insertMany(sampleDoctors);
    console.log(`Inserted ${doctors.length} sample doctors`);

    // Log the created doctors by clinic
    for (const clinic of clinics) {
      const clinicDoctors = doctors.filter(doc => doc.profile?.clinicId?.toString() === clinic._id.toString());
      console.log(`\n${clinic.name}:`);
      clinicDoctors.forEach(doctor => {
        console.log(`  - ${doctor.name} (${doctor.profile?.specialty})`);
      });
    }

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