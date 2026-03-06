const axios = require('axios');

async function testAuthenticatedAppointmentAPI() {
  try {
    // First, login to get a token
    console.log('Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'test@example.com', // Use the test patient email
      password: 'password123'
    });

    const token = loginResponse.data.data?.tokens?.accessToken;
    if (!token) {
      console.log('❌ No token received from login');
      console.log('Login response:', loginResponse.data);
      return;
    }

    console.log('✅ Login successful, got token');

    // Now test the appointment creation with authentication
    const testData = {
      doctor: '69aaa395bec071d4650d3622',
      appointmentDate: '2026-03-07T10:50:00.000Z',
      duration: 30,
      type: 'consultation',
      reason: 'Authenticated API test appointment'
    };

    console.log('Testing authenticated API endpoint...');
    console.log('Data being sent:', testData);

    const response = await axios.post('http://localhost:5000/api/v1/appointments', testData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ API Response:', response.data);
    
  } catch (error) {
    console.error('❌ API Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.log('Full error response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testAuthenticatedAppointmentAPI();
