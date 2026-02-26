import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { redisClient } from '@/config/redis';

let mongod: MongoMemoryServer;

// Increase timeout for setup
jest.setTimeout(30000);

// Mock Redis
jest.mock('@/config/redis', () => ({
  redisClient: {
    get: jest.fn(),
    set: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    incr: jest.fn(),
    lrange: jest.fn(),
    expire: jest.fn(),
  },
}));

// Mock email service
jest.mock('@/services/EmailService', () => ({
  EmailService: {
    sendWelcomeEmail: jest.fn().mockResolvedValue(true),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
    sendAppointmentConfirmation: jest.fn().mockResolvedValue(true),
    sendCancellationNotification: jest.fn().mockResolvedValue(true),
    sendRescheduleNotification: jest.fn().mockResolvedValue(true),
  },
}));

// Mock notification service
jest.mock('@/services/NotificationService', () => ({
  NotificationService: {
    sendAppointmentConfirmation: jest.fn().mockResolvedValue(true),
    sendCancellationNotification: jest.fn().mockResolvedValue(true),
    sendRescheduleNotification: jest.fn().mockResolvedValue(true),
    sendReminder: jest.fn().mockResolvedValue(true),
  },
}));

// Setup before all tests
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

// Clear all data after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  jest.clearAllMocks();
});

// Close connections after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});



// import { MongoMemoryServer } from 'mongodb-memory-server';
// import mongoose from 'mongoose';

// let mongoServer: MongoMemoryServer;

// // Setup before all tests
// beforeAll(async () => {
//   // Create in-memory MongoDB instance
//   mongoServer = await MongoMemoryServer.create();
//   const mongoUri = mongoServer.getUri();

//   // Connect to the in-memory database
//   await mongoose.connect(mongoUri);
// });

// // Cleanup after all tests
// afterAll(async () => {
//   // Disconnect and stop the in-memory database
//   await mongoose.disconnect();
//   await mongoServer.stop();
// });

// // Clear all collections after each test
// afterEach(async () => {
//   const collections = mongoose.connection.collections;
//   for (const key in collections) {
//     await collections[key].deleteMany({});
//   }
// });

// // Set test environment variables
// process.env.NODE_ENV = 'test';
// process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
// process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-for-testing-only';
// process.env.JWT_EXPIRES_IN = '1h';
// process.env.JWT_REFRESH_EXPIRES_IN = '7d';
// process.env.BCRYPT_SALT_ROUNDS = '10'; // Lower for faster tests
