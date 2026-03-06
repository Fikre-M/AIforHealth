import mongoose from 'mongoose';
import { Clinic } from '../models/Clinic';
import User from '../models/User';
import env from '../config/env';

async function checkData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check clinics
    const clinics = await Clinic.find({});
    console.log(`\n=== CLINICS ===`);
    console.log(`Total clinics: ${clinics.length}`);
    if (clinics.length > 0) {
      clinics.forEach((clinic, index) => {
        console.log(`${index + 1}. ${clinic.name} - ${clinic.specialties.join(', ')}`);
      });
    } else {
      console.log('No clinics found in database');
    }

    // Check doctors
    const doctors = await User.find({ role: 'doctor' });
    console.log(`\n=== DOCTORS ===`);
    console.log(`Total doctors: ${doctors.length}`);
    if (doctors.length > 0) {
      doctors.forEach((doctor, index) => {
        console.log(`${index + 1}. ${doctor.name} - ${doctor.specialization || 'No specialization'}`);
      });
    } else {
      console.log('No doctors found in database');
    }

  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the check if this file is executed directly
if (require.main === module) {
  checkData();
}

export { checkData };
