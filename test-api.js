const http = require('http');

function testAPI(path, description) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/v1${path}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log(`\n✅ ${description}`);
          console.log(`Status: ${res.statusCode}`);
          console.log('Response:', JSON.stringify(parsed, null, 2));
          resolve(parsed);
        } catch (error) {
          console.error(`\n❌ ${description} - Parse Error`);
          console.error('Raw data:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`\n❌ ${description} - Request Error`);
      console.error(error.message);
      reject(error);
    });

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Backend API...\n');

  try {
    // Test 1: Get clinics
    const clinicsResponse = await testAPI('/clinics', 'GET /clinics');
    const clinics = clinicsResponse.data?.clinics || clinicsResponse.clinics || [];
    console.log(`\n📊 Found ${clinics.length} clinics`);
    
    if (clinics.length > 0) {
      const firstClinic = clinics[0];
      console.log(`\n🏥 First clinic: ${firstClinic.name}`);
      console.log(`   ID: ${firstClinic.id || firstClinic._id}`);
      
      // Test 2: Get doctors for first clinic
      const clinicId = firstClinic.id || firstClinic._id;
      const doctorsResponse = await testAPI(`/clinics/${clinicId}/doctors`, `GET /clinics/${clinicId}/doctors`);
      const doctors = doctorsResponse.data?.doctors || doctorsResponse.doctors || [];
      console.log(`\n📊 Found ${doctors.length} doctors for ${firstClinic.name}`);
      
      if (doctors.length > 0) {
        console.log(`\n👨‍⚕️ First doctor: ${doctors[0].name}`);
        console.log(`   Specialty: ${doctors[0].specialty}`);
        console.log(`   ID: ${doctors[0].id || doctors[0]._id}`);
      } else {
        console.log('\n⚠️  No doctors found for this clinic!');
      }
    } else {
      console.log('\n⚠️  No clinics found! Run: npm run db:seed');
    }

    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();
