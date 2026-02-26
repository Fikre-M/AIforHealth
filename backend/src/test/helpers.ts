import * as jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

/**
 * Generate a valid JWT token for testing
 */
export const generateTestToken = (userId: string, role: string = 'patient'): string => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET!,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      algorithm: 'HS256'
    } as jwt.SignOptions
  );
};

/**
 * Generate a valid MongoDB ObjectId
 */
export const generateObjectId = (): string => {
  return new Types.ObjectId().toString();
};

/**
 * Create mock user data
 */
export const createMockUser = (overrides = {}) => ({
  _id: generateObjectId(),
  email: 'test@example.com',
  name: 'Test User',
  role: 'patient',
  password: 'hashedPassword123',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * Create mock patient data
 */
export const createMockPatient = (overrides = {}) => ({
  _id: generateObjectId(),
  userId: generateObjectId(),
  dateOfBirth: new Date('1990-01-01'),
  phone: '123-456-7890',
  address: {
    street: '123 Main St',
    city: 'Test City',
    state: 'TS',
    zipCode: '12345',
  },
  emergencyContact: {
    name: 'Emergency Contact',
    phone: '098-765-4321',
    relationship: 'Spouse',
  },
  medicalHistory: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * Create mock doctor data
 */
export const createMockDoctor = (overrides = {}) => ({
  _id: generateObjectId(),
  userId: generateObjectId(),
  specialty: 'Cardiology',
  licenseNumber: 'LIC123456',
  phone: '123-456-7890',
  availability: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * Create mock appointment data
 */
export const createMockAppointment = (overrides = {}) => ({
  _id: generateObjectId(),
  patientId: generateObjectId(),
  doctorId: generateObjectId(),
  date: new Date('2024-03-20'),
  time: '10:00',
  duration: 30,
  status: 'scheduled',
  reason: 'Regular checkup',
  notes: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * Wait for a specified time (useful for async operations)
 */
export const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Mock Express request object
 */
export const mockRequest = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  user: null,
  ...overrides,
});

/**
 * Mock Express response object
 */
export const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  return res;
};

/**
 * Mock Express next function
 */
export const mockNext = jest.fn();
