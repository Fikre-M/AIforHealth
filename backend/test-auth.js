const axios = require('axios');

async function testAuth() {
  try {
    console.log('🧪 Testing authentication flow...');
    
    // Test 1: Try to login with existing user first
    console.log('\n1️⃣ Trying to login with existing user...');
    try {
      const existingLoginResponse = await axios.post('http://localhost:5000/api/v1/auth/login', {
        email: 'test@example.com',
        password: 'Password123!'
      });
      console.log('✅ Existing user login successful:', existingLoginResponse.data);
      
      // Test 2: Refresh token
      console.log('\n2️⃣ Testing refresh token...');
      const refreshToken = existingLoginResponse.data.data.tokens.refreshToken;
      console.log('🔄 Refresh token:', refreshToken);
      
      const refreshResponse = await axios.post('http://localhost:5000/api/v1/auth/refresh-token', {
        refreshToken: refreshToken
      });
      console.log('✅ Refresh token successful:', refreshResponse.data);
      
    } catch (loginError) {
      console.log('🔍 Existing user login failed, trying to register new user...');
      
      // Test 2: Register a user
      console.log('\n2️⃣ Registering new user...');
      const registerResponse = await axios.post('http://localhost:5000/api/v1/auth/register', {
        name: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'Password123!',
        phone: '+1234567890',
        role: 'patient',
        termsAccepted: true
      });
      console.log('✅ Registration successful:', registerResponse.data);
      
      // Test 3: Login with the new user
      console.log('\n3️⃣ Logging in with new user...');
      const loginResponse = await axios.post('http://localhost:5000/api/v1/auth/login', {
        email: 'test@example.com',
        password: 'Password123!'
      });
      console.log('✅ Login successful:', loginResponse.data);
      
      // Test 4: Refresh token
      console.log('\n4️⃣ Testing refresh token...');
      const refreshToken = loginResponse.data.data.tokens.refreshToken;
      console.log('🔄 Refresh token:', refreshToken);
      
      const refreshResponse = await axios.post('http://localhost:5000/api/v1/auth/refresh-token', {
        refreshToken: refreshToken
      });
      console.log('✅ Refresh token successful:', refreshResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data?.details?.errors) {
      console.log('🔍 Validation errors:', JSON.stringify(error.response.data.details.errors, null, 2));
    }
    if (error.response?.status === 401) {
      console.log('🔍 This might be the "no refresh token available" error you mentioned');
    }
  }
}

testAuth();
