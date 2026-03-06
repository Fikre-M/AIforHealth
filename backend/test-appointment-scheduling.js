const axios = require('axios');

async function testAppointmentScheduling() {
  try {
    console.log('Testing appointment scheduling...');
    
    // First register a new user
    const userData = {
      name: 'Test Appointment User',
      email: `testappt${Date.now()}@example.com`,
      password: 'Password123!',
      role: 'patient'
    };

    console.log('Step 1: Registering new user...');
    const regResponse = await axios.post('http://localhost:5000/api/v1/auth/register', userData);
    const newUserId = regResponse.data.data.user._id;
    console.log('✅ User registered:', newUserId);

    // Now create an appointment for this new user
    const appointmentData = {
      patientId: newUserId, // Use the newly created user's ID
      doctor: '69aaa395bec071d4650d3622', // Use existing doctor
      appointmentDate: '2026-03-08T10:00:00.000Z',
      duration: 30,
      type: 'consultation',
      reason: 'Test appointment for new user'
    };

    console.log('Step 2: Creating appointment...');
    console.log('Appointment data:', appointmentData);

    const aptResponse = await axios.post('http://localhost:5000/api/v1/appointments', appointmentData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Appointment Response:', aptResponse.data);
    
    // Check if appointment was actually created in database
    const appointmentId = aptResponse.data.data.appointment._id;
    const testAppointment = await checkAppointmentInDatabase(appointmentId);
    if (testAppointment) {
      console.log('✅ Appointment found in database:', testAppointment.confirmationNumber);
    } else {
      console.log('❌ Appointment NOT found in database');
    }
    
  } catch (error) {
    console.error('❌ Scheduling Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.log('Full error response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

async function checkAppointmentInDatabase(appointmentId) {
  const mongoose = require('mongoose');
  require('dotenv').config();
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    require('./dist/models/Appointment.js');
    const Appointment = mongoose.model('Appointment');
    
    const appointment = await Appointment.findById(appointmentId);
    return appointment;
  } catch (error) {
    console.error('Database check error:', error.message);
    return null;
  } finally {
    await mongoose.disconnect();
  }
}

testAppointmentScheduling();
