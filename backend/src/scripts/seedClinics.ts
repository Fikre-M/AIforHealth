import mongoose from 'mongoose';
import { Clinic } from '../models/Clinic';
import env from '../config/env';

const sampleClinics = [
  {
    name: 'City General Hospital',
    address: '123 Main Street, Downtown, City 12345',
    phone: '+1-555-0101',
    rating: 4.5,
    specialties: ['Emergency Medicine', 'Internal Medicine', 'Surgery', 'Cardiology', 'Pediatrics'],
    isOpen: true,
    openingHours: {
      monday: { open: '00:00', close: '23:59' },
      tuesday: { open: '00:00', close: '23:59' },
      wednesday: { open: '00:00', close: '23:59' },
      thursday: { open: '00:00', close: '23:59' },
      friday: { open: '00:00', close: '23:59' },
      saturday: { open: '00:00', close: '23:59' },
      sunday: { open: '00:00', close: '23:59' },
    },
    location: {
      type: 'Point',
      coordinates: [-74.006, 40.7128], // New York coordinates
    },
  },
  {
    name: 'Westside Medical Center',
    address: '456 Oak Avenue, Westside, City 12346',
    phone: '+1-555-0102',
    rating: 4.2,
    specialties: ['Family Medicine', 'Dermatology', 'Orthopedics', 'Gynecology'],
    isOpen: true,
    openingHours: {
      monday: { open: '08:00', close: '18:00' },
      tuesday: { open: '08:00', close: '18:00' },
      wednesday: { open: '08:00', close: '18:00' },
      thursday: { open: '08:00', close: '18:00' },
      friday: { open: '08:00', close: '18:00' },
      saturday: { open: '09:00', close: '17:00' },
      sunday: { open: '10:00', close: '16:00' },
    },
    location: {
      type: 'Point',
      coordinates: [-74.016, 40.7228],
    },
  },
  {
    name: 'Eastside Specialty Clinic',
    address: '789 Pine Street, Eastside, City 12347',
    phone: '+1-555-0103',
    rating: 4.7,
    specialties: ['Neurology', 'Psychiatry', 'Endocrinology', 'Rheumatology'],
    isOpen: true,
    openingHours: {
      monday: { open: '07:00', close: '19:00' },
      tuesday: { open: '07:00', close: '19:00' },
      wednesday: { open: '07:00', close: '19:00' },
      thursday: { open: '07:00', close: '19:00' },
      friday: { open: '07:00', close: '19:00' },
      saturday: { open: '08:00', close: '16:00' },
      sunday: null, // Closed on Sunday
    },
    location: {
      type: 'Point',
      coordinates: [-73.996, 40.7328],
    },
  },
  {
    name: 'Northside Community Health',
    address: '321 Elm Drive, Northside, City 12348',
    phone: '+1-555-0104',
    rating: 4.0,
    specialties: ['Family Medicine', 'Pediatrics', 'Preventive Care', 'Mental Health'],
    isOpen: true,
    openingHours: {
      monday: { open: '08:00', close: '17:00' },
      tuesday: { open: '08:00', close: '17:00' },
      wednesday: { open: '08:00', close: '17:00' },
      thursday: { open: '08:00', close: '17:00' },
      friday: { open: '08:00', close: '17:00' },
      saturday: { open: '09:00', close: '15:00' },
      sunday: null, // Closed on Sunday
    },
    location: {
      type: 'Point',
      coordinates: [-74.026, 40.7428],
    },
  },
  {
    name: 'Southside Urgent Care',
    address: '654 Maple Boulevard, Southside, City 12349',
    phone: '+1-555-0105',
    rating: 3.8,
    specialties: ['Urgent Care', 'Minor Surgery', 'X-Ray Services', 'Lab Services'],
    isOpen: true,
    openingHours: {
      monday: { open: '06:00', close: '22:00' },
      tuesday: { open: '06:00', close: '22:00' },
      wednesday: { open: '06:00', close: '22:00' },
      thursday: { open: '06:00', close: '22:00' },
      friday: { open: '06:00', close: '22:00' },
      saturday: { open: '08:00', close: '20:00' },
      sunday: { open: '10:00', close: '18:00' },
    },
    location: {
      type: 'Point',
      coordinates: [-74.036, 40.7028],
    },
  },
];

async function seedClinics() {
  try {
    // Connect to MongoDB
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing clinics
    await Clinic.deleteMany({});
    console.log('Cleared existing clinics');

    // Insert sample clinics
    const clinics = await Clinic.insertMany(sampleClinics);
    console.log(`Inserted ${clinics.length} sample clinics`);

    // Log the created clinics
    clinics.forEach((clinic) => {
      console.log(`- ${clinic.name} (ID: ${clinic._id})`);
    });

    console.log('Clinic seeding completed successfully');
  } catch (error) {
    console.error('Error seeding clinics:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedClinics();
}

export { seedClinics };
