const mongoose = require('mongoose');
require('dotenv').config();

async function checkDatabaseConnection() {
  try {
    console.log('🔍 Checking database connection...');
    console.log('📡 MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'NOT SET');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get database info
    const db = mongoose.connection.db;
    console.log('🗄️ Database name:', db.databaseName);
    console.log('📍 Connection host:', db.host);
    console.log('🔌 Connection port:', db.port);
    
    // Import models
    require('./dist/models/User.js');
    require('./dist/models/Appointment.js');
    
    const User = mongoose.model('User');
    const Appointment = mongoose.model('Appointment');
    
    // Check current counts
    const userCount = await User.countDocuments();
    const appointmentCount = await Appointment.countDocuments();
    
    console.log('👥 Current user count:', userCount);
    console.log('📅 Current appointment count:', appointmentCount);
    
    // Get latest entries
    const latestUsers = await User.find().sort({ createdAt: -1 }).limit(3);
    const latestAppointments = await Appointment.find().sort({ createdAt: -1 }).limit(3);
    
    console.log('\n📋 Latest 3 users:');
    latestUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Created: ${user.createdAt}`);
    });
    
    console.log('\n📋 Latest 3 appointments:');
    latestAppointments.forEach((apt, index) => {
      console.log(`${index + 1}. ${apt.confirmationNumber} - Created: ${apt.createdAt}`);
    });
    
    // Create a test user to verify insertion
    console.log('\n🧪 Creating test user...');
    const testUser = await User.create({
      name: `Test User ${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      password: 'Password123!',
      role: 'patient'
    });
    
    console.log('✅ Test user created:', testUser._id);
    
    // Check count after creation
    const newCount = await User.countDocuments();
    console.log('👥 User count after creation:', newCount);
    
    if (newCount > userCount) {
      console.log('✅ Database insertion is working correctly');
    } else {
      console.log('❌ Database insertion failed - count did not change');
    }
    
    // Clean up test user
    await User.findByIdAndDelete(testUser._id);
    console.log('🧹 Test user cleaned up');
    
  } catch (error) {
    console.error('❌ Database check error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkDatabaseConnection();
