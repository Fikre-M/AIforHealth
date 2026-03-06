const mongoose = require('mongoose');
require('dotenv').config();

async function createDatabaseMarker() {
  try {
    console.log('🔍 Creating database marker to verify connection...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get database info
    const db = mongoose.connection.db;
    console.log('🗄️ Database name:', db.databaseName);
    console.log('📡 Full connection string:', process.env.MONGODB_URI?.replace(/\/\/.*@/, '//***:***@'));
    
    // Import models
    require('./dist/models/User.js');
    require('./dist/models/Appointment.js');
    
    const User = mongoose.model('User');
    const Appointment = mongoose.model('Appointment');
    
    // Create a unique marker user
    const timestamp = new Date().toISOString();
    const markerEmail = `MARKER-${timestamp}@verification.com`;
    
    console.log('🏷️ Creating marker user:', markerEmail);
    
    const markerUser = await User.create({
      name: `DATABASE MARKER - ${timestamp}`,
      email: markerEmail,
      password: 'Password123!',
      role: 'patient'
    });
    
    console.log('✅ Marker user created with ID:', markerUser._id);
    
    // Create a marker appointment
    const markerAppointment = await Appointment.create({
      patient: markerUser._id,
      doctor: '69aaa395bec071d4650d3622', // Use existing doctor
      appointmentDate: new Date(),
      duration: 30,
      type: 'consultation',
      reason: `DATABASE MARKER APPOINTMENT - ${timestamp}`,
      confirmationNumber: `MARKER-${Date.now()}`
    });
    
    console.log('✅ Marker appointment created with ID:', markerAppointment._id);
    console.log('🔢 Marker confirmation:', markerAppointment.confirmationNumber);
    
    // Get final counts
    const userCount = await User.countDocuments();
    const appointmentCount = await Appointment.countDocuments();
    
    console.log('\n📊 FINAL COUNTS:');
    console.log('👥 Total users:', userCount);
    console.log('📅 Total appointments:', appointmentCount);
    
    console.log('\n🔍 INSTRUCTIONS:');
    console.log('1. Check MongoDB Compass for database:', db.databaseName);
    console.log('2. Look for user with email:', markerEmail);
    console.log('3. Look for appointment with confirmation:', markerAppointment.confirmationNumber);
    console.log('4. If you cannot find these, you are looking at the WRONG database!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createDatabaseMarker();
