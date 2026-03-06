const mongoose = require('mongoose');
require('dotenv').config();

// Import the compiled models
require('./dist/models/User.js');
require('./dist/models/Appointment.js');

async function testAppointmentCreation() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get models
    const Appointment = mongoose.model('Appointment');
    const User = mongoose.model('User');

    // Get a test doctor and patient
    const doctor = await User.findOne({ role: 'doctor' });
    const patient = await User.findOne({ role: 'patient' });

    if (!doctor || !patient) {
      console.log('No test doctor or patient found');
      return;
    }

    console.log('Test doctor:', doctor._id, doctor.name);
    console.log('Test patient:', patient._id, patient.name);

    // Create a test appointment
    const testAppointment = {
      patient: patient._id,
      doctor: doctor._id,
      appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      duration: 30,
      type: 'consultation',
      reason: 'Test appointment creation',
      confirmationNumber: 'TEST-' + Date.now()
    };

    console.log('Creating appointment:', testAppointment);

    const appointment = await Appointment.create(testAppointment);
    console.log('✅ Appointment created successfully:', appointment._id);

    // Verify it was saved
    const savedAppointment = await Appointment.findById(appointment._id);
    if (savedAppointment) {
      console.log('✅ Appointment verified in database');
      console.log('Appointment details:', {
        id: savedAppointment._id,
        patient: savedAppointment.patient,
        doctor: savedAppointment.doctor,
        date: savedAppointment.appointmentDate,
        confirmationNumber: savedAppointment.confirmationNumber
      });
    } else {
      console.log('❌ Appointment not found in database');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
  }
}

testAppointmentCreation();
