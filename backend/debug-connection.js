const mongoose = require('mongoose');
require('dotenv').config();

async function debugConnection() {
  try {
    console.log('🔍 Detailed connection debugging...');
    
    // Show the exact URI (masked)
    const uri = process.env.MONGODB_URI;
    console.log('📡 Raw URI:', uri);
    console.log('📡 Masked URI:', uri?.replace(/\/\/.*@/, '//***:***@'));
    
    // Parse connection string
    if (uri) {
      const url = new URL(uri);
      console.log('🌐 Hostname:', url.hostname);
      console.log('🗄️ Database name:', url.pathname.substring(1)); // Remove leading /
      console.log('🔌 Port:', url.port || '27017 (default)');
      console.log('🔗 Protocol:', url.protocol);
    }
    
    // Connect and get connection details
    await mongoose.connect(uri);
    
    const connection = mongoose.connection;
    console.log('📍 Connection readyState:', connection.readyState);
    console.log('📍 Connection host:', connection.host);
    console.log('📍 Connection port:', connection.port);
    console.log('📍 Connection name:', connection.name);
    
    // Get database admin info
    const db = connection.db;
    console.log('🗄️ Database databaseName:', db.databaseName);
    console.log('📍 Database host:', db.serverConfig?.host || 'Not available');
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('📁 Collections found:', collections.map(c => c.name));
    
    // Import models
    require('./dist/models/User.js');
    require('./dist/models/Appointment.js');
    
    const User = mongoose.model('User');
    const Appointment = mongoose.model('Appointment');
    
    // Get exact counts with different methods
    const userCount1 = await User.countDocuments();
    const userCount2 = await User.find().countDocuments();
    const userCount3 = 'N/A (deprecated method)';
    
    const aptCount1 = await Appointment.countDocuments();
    const aptCount2 = await Appointment.find().countDocuments();
    const aptCount3 = 'N/A (deprecated method)';
    
    console.log('\n👥 User counts (different methods):');
    console.log('  countDocuments():', userCount1);
    console.log('  find().countDocuments():', userCount2);
    console.log('  count():', userCount3);
    
    console.log('\n📅 Appointment counts (different methods):');
    console.log('  countDocuments():', aptCount1);
    console.log('  find().countDocuments():', aptCount2);
    console.log('  count():', aptCount3);
    
    // Check if there are multiple databases
    const admin = mongoose.connection.db.admin();
    try {
      const databases = await admin.listDatabases();
      console.log('\n🗄️ All databases on cluster:');
      databases.databases.forEach(db => {
        console.log(`  - ${db.name} (size: ${db.sizeOnDisk || 'N/A'})`);
      });
    } catch (err) {
      console.log('\n⚠️ Cannot list all databases (permission issue)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

debugConnection();
