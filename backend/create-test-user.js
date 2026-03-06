const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import the compiled models
require('./dist/models/User.js');

async function createTestUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get User model
    const User = mongoose.model('User');

    // Delete existing test user if exists
    await User.deleteOne({ email: 'test@example.com' });

    // Create new test user with password
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'patient',
      isActive: true
    });

    console.log('✅ Test user created successfully:');
    console.log('- Email:', testUser.email);
    console.log('- ID:', testUser._id);
    console.log('- Password hash exists:', !!testUser.password);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createTestUser();
