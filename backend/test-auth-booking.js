const axios = require('axios');

async function testAuthenticatedBooking() {
  try {
    console.log('🔐 Testing authenticated appointment booking...');
    
    // First, create a new user to test with
    console.log('Step 1: Creating test user...');
    const userData = {
      name: 'Auth Test User',
      email: `authtest${Date.now()}@example.com`,
      password: 'Password123!',
      role: 'patient'
    };

    const regResponse = await axios.post('http://localhost:5000/api/v1/auth/register', userData);
    console.log('✅ User created:', regResponse.data.data.user.email);
    
    // Now login with the new user
    console.log('Step 2: Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: userData.email,
      password: userData.password
    });

    const token = loginResponse.data.data?.tokens?.accessToken;
    if (!token) {
      console.log('❌ Login failed - no token received');
      return;
    }

    console.log('✅ Login successful, got token');

    // Now try to create an appointment with authentication
    const appointmentData = {
      doctor: '69aaa395bec071d4650d3622',
      appointmentDate: '2026-03-09T10:00:00.000Z',
      duration: 30,
      type: 'consultation',
      reason: 'Authenticated test appointment'
    };

    console.log('Step 3: Creating appointment with authentication...');
    console.log('Data:', appointmentData);

    const response = await axios.post('http://localhost:5000/api/v1/appointments', appointmentData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Authenticated booking successful!');
    console.log('Appointment ID:', response.data.data.appointment._id);
    console.log('Confirmation:', response.data.data.confirmationNumber);
    
    // Verify in database
    const testAppointment = await checkAppointmentInDatabase(response.data.data.appointment._id);
    if (testAppointment) {
      console.log('✅ Appointment verified in database');
    } else {
      console.log('❌ Appointment NOT found in database');
    }
    
  } catch (error) {
    console.error('❌ Authenticated booking error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('🔐 Authentication required - this is expected behavior');
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

testAuthenticatedBooking();
