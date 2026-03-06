const axios = require('axios');

async function testFrontendBookingFlow() {
  try {
    console.log('Testing frontend booking flow...');
    
    // Simulate exactly what the frontend sends
    const formData = {
      doctorId: '69aaa395bec071d4650d3622',
      date: '2026-03-08',
      time: '10:00',
      appointmentType: 'consultation',
      reason: 'Frontend test booking',
      notes: '',
      urgency: 'routine'
    };

    // This is exactly what the frontend sends
    const appointmentRequest = {
      doctor: formData.doctorId, // Backend validation expects 'doctor' field
      appointmentDate: `${formData.date}T${formData.time}:00`,
      duration: 30,
      type: formData.appointmentType,
      reason: formData.reason,
    };

    console.log('Sending frontend-style request:', appointmentRequest);

    // Test without authentication (like we set up)
    const response = await axios.post('http://localhost:5000/api/v1/appointments', appointmentRequest, {
      headers: {
        'Content-Type': 'application/json'
        // No Authorization header - simulating frontend without token
      }
    });

    console.log('✅ Frontend-style booking successful:', response.data);
    
    // Verify in database
    const appointmentId = response.data.data.appointment._id;
    const testAppointment = await checkAppointmentInDatabase(appointmentId);
    if (testAppointment) {
      console.log('✅ Appointment verified in database:', testAppointment.confirmationNumber);
    } else {
      console.log('❌ Appointment NOT found in database');
    }
    
  } catch (error) {
    console.error('❌ Frontend-style booking failed:', error.response?.data || error.message);
    console.log('This explains why frontend falls back to demo mode!');
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

testFrontendBookingFlow();
