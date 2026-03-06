const mongoose = require('mongoose');
require('dotenv').config();

// Import the compiled models
require('./dist/models/User.js');

async function checkUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get User model
    const User = mongoose.model('User');

    // Check all users
    const users = await User.find({});
    console.log('Found users:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkUsers();
