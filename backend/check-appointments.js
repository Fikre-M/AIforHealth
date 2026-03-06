const mongoose = require('mongoose');
require('dotenv').config();

// Import the compiled models
require('./dist/models/Appointment.js');

async function checkAppointments() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get Appointment model
    const Appointment = mongoose.model('Appointment');

    // Check recent appointments
    const appointments = await Appointment.find({})
      .sort({ createdAt: -1 })
      .limit(5);

    console.log(`Found ${appointments.length} recent appointments:`);
    appointments.forEach((apt, index) => {
      console.log(`${index + 1}. ID: ${apt._id}`);
      console.log(`   Patient: ${apt.patient}`);
      console.log(`   Doctor: ${apt.doctor}`);
      console.log(`   Date: ${apt.appointmentDate}`);
      console.log(`   Confirmation: ${apt.confirmationNumber}`);
      console.log(`   Created: ${apt.createdAt}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkAppointments();
