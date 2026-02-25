const axios = require('axios');

async function testAppointmentCreation() {
  try {
    // First, login as patient
    console.log('Logging in as patient...');
    const loginResponse = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'patient@aiforhealth.com',
      password: 'Patient123!@#'
    });
    
    const token = loginResponse.data.data.tokens.accessToken;
    console.log('Login successful, token received');
    
    // Create appointment
    console.log('Creating appointment...');
    const appointmentData = {
      doctor: '699e633fe6be04b7075ff3e8', // Real doctor ID from database
      appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      duration: 30,
      type: 'consultation',
      reason: 'Regular checkup and consultation',
      notes: 'Test appointment creation',
      isEmergency: false
    };
    
    const appointmentResponse = await axios.post(
      'http://localhost:5000/api/v1/appointments',
      appointmentData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Appointment created successfully!');
    console.log('Response:', JSON.stringify(appointmentResponse.data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testAppointmentCreation();