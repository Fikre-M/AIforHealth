const axios = require('axios');

async function testAppointmentAPI() {
  try {
    // Test the API endpoint without authentication first
    const testData = {
      doctor: '69aaa395bec071d4650d3622', // Use the doctor ID from our test
      appointmentDate: '2026-03-07T10:45:00.000Z',
      duration: 30,
      type: 'consultation',
      reason: 'API test appointment creation'
    };

    console.log('Testing API endpoint...');
    console.log('Data being sent:', testData);

    const response = await axios.post('http://localhost:5000/api/v1/appointments', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ API Response:', response.data);
    
  } catch (error) {
    console.error('❌ API Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('🔐 Authentication required - this is expected');
    }
  }
}

testAppointmentAPI();
