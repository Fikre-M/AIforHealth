import { AuthService } from '../AuthService';
import { User } from '@/models/User';
import { TokenService } from '../TokenService';
import { EmailService } from '../EmailService';
import { redisClient } from '@/config/redis';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('@/models/User');
jest.mock('../TokenService');
jest.mock('../EmailService');
jest.mock('@/config/redis');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const MockedUser = User as jest.Mocked<typeof User>;
const MockedTokenService = TokenService as jest.Mocked<typeof TokenService>;
const MockedEmailService = EmailService as jest.Mocked<typeof EmailService>;
const MockedRedis = redisClient as jest.Mocked<typeof redisClient>;
const MockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const MockedJwt = jwt as jest.Mocked<typeof jwt>;

describe('AuthService', () => {
  let mockUser: {
    _id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
    isLocked: boolean;
    loginAttempts: number;
    lockUntil: Date | null;
    lastLogin: Date | null;
    save: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUser = {
      _id: 'user123',
      email: 'test@example.com',
      password: 'hashedPassword',
      firstName: 'John',
      lastName: 'Doe',
      role: 'patient',
      isActive: true,
      isLocked: false,
      loginAttempts: 0,
      lockUntil: null,
      lastLogin: null,
      save: jest.fn().mockResolvedValue(true),
    };

    MockedBcrypt.compare.mockResolvedValue(true);
    MockedTokenService.generateTokens.mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
      expiresIn: 900,
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      MockedUser.findOne.mockResolvedValue(mockUser as never);

      const result = await AuthService.login('test@example.com', 'password123', '127.0.0.1');

      expect(result.user.email).toBe('test@example.com');
      expect(result.tokens.accessToken).toBe('access');
    });

    it('should throw if user not found', async () => {
      MockedUser.findOne.mockResolvedValue(null as never);

      await expect(AuthService.login('x@example.com', 'pass', 'ip')).rejects.toThrow();
    });
  });
});
