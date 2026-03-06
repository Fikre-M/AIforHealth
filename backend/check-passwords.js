const mongoose = require('mongoose');
require('dotenv').config();

// Import the compiled models
require('./dist/models/User.js');

async function checkUserPasswords() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get User model
    const User = mongoose.model('User');

    // Check test user
    const testUser = await User.findOne({ email: 'test@example.com' });
    if (testUser) {
      console.log('Test user found:');
      console.log('- Email:', testUser.email);
      console.log('- Password hash exists:', !!testUser.password);
      console.log('- Role:', testUser.role);
    } else {
      console.log('Test user not found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkUserPasswords();
