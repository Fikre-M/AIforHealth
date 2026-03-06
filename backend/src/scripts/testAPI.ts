import mongoose from 'mongoose';
import { Clinic } from '../models/Clinic';
import User from '../models/User';
import env from '../config/env';

async function testAPI() {
  try {
    // Connect to MongoDB
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Test clinic data format (simulate API response)
    const clinics = await Clinic.find({});
    console.log('\n=== TESTING CLINIC API RESPONSE FORMAT ===');
    
    const clinicResponse = {
      clinics: clinics.map(clinic => ({
        id: clinic._id,
        name: clinic.name,
        address: clinic.address,
        phone: clinic.phone,
        rating: clinic.rating,
        specialties: clinic.specialties,
        image: clinic.image,
        isOpen: clinic.isOpen,
        openingHours: clinic.openingHours,
        distance: (clinic as any).distance || null
      }))
    };
    
    console.log('Clinic API Response:', JSON.stringify(clinicResponse, null, 2));

    // Test doctor data format (simulate API response for getDoctorsByClinic)
    console.log('\n=== TESTING DOCTOR API RESPONSE FORMAT ===');
    
    const doctors = await User.find({ role: 'doctor' });
    const sampleClinic = clinics[0];
    
    const doctorResponse = {
      doctors: doctors.map(doctor => ({
        id: doctor._id,
        name: doctor.name,
        specialty: doctor.specialization || 'General Medicine',
        clinicId: sampleClinic._id,
        clinicName: sampleClinic.name,
        rating: 4.5,
        experience: 5,
        education: ['Medical Degree'],
        languages: ['English'],
        avatar: doctor.avatar,
        consultationFee: 100,
        nextAvailable: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        isAvailable: doctor.isActive
      })),
      clinic: {
        id: sampleClinic._id,
        name: sampleClinic.name
      }
    };
    
    console.log('Doctor API Response:', JSON.stringify(doctorResponse, null, 2));

    // Test specific clinic with doctors
    console.log('\n=== TESTING SPECIFIC CLINIC DOCTORS ===');
    console.log(`Clinic: ${sampleClinic.name}`);
    console.log('Available doctors:');
    doctors.forEach((doctor, index) => {
      console.log(`  ${index + 1}. ${doctor.name} - ${doctor.specialization || 'General Medicine'}`);
    });

  } catch (error) {
    console.error('Error testing API:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testAPI();
}

export { testAPI };
