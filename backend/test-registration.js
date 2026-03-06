const axios = require('axios');

async function testUserRegistration() {
  try {
    console.log('Testing user registration...');
    
    const userData = {
      name: 'Test New User',
      email: `testuser${Date.now()}@example.com`,
      password: 'Password123!', // Add complexity requirements
      role: 'patient'
    };

    console.log('Sending registration data:', userData);

    const response = await axios.post('http://localhost:5000/api/v1/auth/register', userData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Registration Response:', response.data);
    
    // Check if user was actually created in database
    const testUser = await checkUserInDatabase(userData.email);
    if (testUser) {
      console.log('✅ User found in database:', testUser._id);
    } else {
      console.log('❌ User NOT found in database');
    }
    
  } catch (error) {
    console.error('❌ Registration Error:', error.response?.data || error.message);
    if (error.response?.data?.details?.errors) {
      console.log('Validation errors:', JSON.stringify(error.response.data.details.errors, null, 2));
    }
  }
}

async function checkUserInDatabase(email) {
  const mongoose = require('mongoose');
  require('dotenv').config();
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    require('./dist/models/User.js');
    const User = mongoose.model('User');
    
    const user = await User.findOne({ email });
    return user;
  } catch (error) {
    console.error('Database check error:', error.message);
    return null;
  } finally {
    await mongoose.disconnect();
  }
}

testUserRegistration();
