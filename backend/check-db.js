// Quick database check script
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/AIforHealth';

async function checkDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // Check collections
    const collections = await db.listCollections().toArray();
    console.log('📦 Collections in database:');
    collections.forEach(col => console.log(`   - ${col.name}`));
    console.log('');

    // Count documents in each collection
    console.log('📊 Document counts:');
    
    if (collections.find(c => c.name === 'clinics')) {
      const clinicsCount = await db.collection('clinics').countDocuments();
      console.log(`   - Clinics: ${clinicsCount}`);
      
      if (clinicsCount > 0) {
        const clinics = await db.collection('clinics').find({}).limit(5).toArray();
        console.log('\n🏥 Sample Clinics:');
        clinics.forEach(clinic => {
          console.log(`   - ${clinic.name} (${clinic.address})`);
        });
      }
    } else {
      console.log('   - Clinics: Collection does not exist');
    }

    if (collections.find(c => c.name === 'users')) {
      const usersCount = await db.collection('users').countDocuments();
      const doctorsCount = await db.collection('users').countDocuments({ role: 'doctor' });
      const patientsCount = await db.collection('users').countDocuments({ role: 'patient' });
      console.log(`   - Users: ${usersCount} (Doctors: ${doctorsCount}, Patients: ${patientsCount})`);
      
      if (doctorsCount > 0) {
        const doctors = await db.collection('users').find({ role: 'doctor' }).limit(5).toArray();
        console.log('\n👨‍⚕️ Sample Doctors:');
        doctors.forEach(doctor => {
          console.log(`   - ${doctor.name} (${doctor.email}) - Specialty: ${doctor.specialization || 'N/A'}`);
        });
      }
    } else {
      console.log('   - Users: Collection does not exist');
    }

    if (collections.find(c => c.name === 'appointments')) {
      const appointmentsCount = await db.collection('appointments').countDocuments();
      console.log(`   - Appointments: ${appointmentsCount}`);
    } else {
      console.log('   - Appointments: Collection does not exist');
    }

    console.log('\n✅ Database check complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkDatabase();
