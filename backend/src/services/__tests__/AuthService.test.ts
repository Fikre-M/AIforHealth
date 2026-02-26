import { AuthService } from '../AuthService';
import { User } from '@/models/User';
import { TokenService } from '../TokenService';
import { EmailService } from '../EmailService';
import { redisClient } from '@/config/redis';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '@/middleware/errorHandler';

// Mock dependencies
jest.mock('@/models/User');
jest.mock('../TokenService');
jest.mock('../EmailService');
jest.mock('@/config/redis');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let mockUser: any;
  let mockDate: Date;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock date
    mockDate = new Date('2024-01-01T00:00:00.000Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

    // Mock user data
    mockUser = {
      _id: 'user123',
      email: 'test@example.com',
      password: 'hashedPassword123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'patient',
      isActive: true,
      isLocked: false,
      loginAttempts: 0,
      lockUntil: null,
      lastLogin: null,
      save: jest.fn().mockResolvedValue(true),
      toObject: jest.fn().mockReturnValue({
        _id: 'user123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'patient',
        isActive: true,
      }),
    };

    // Mock bcrypt
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    // Mock jwt
    (jwt.sign as jest.Mock).mockReturnValue('mock-token');

    // Mock TokenService
    (TokenService.generateTokens as jest.Mock).mockResolvedValue({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresIn: 900,
    });

    // Mock Redis
    (redisClient.get as jest.Mock).mockResolvedValue(null);
    (redisClient.setex as jest.Mock).mockResolvedValue('OK');
    (redisClient.del as jest.Mock).mockResolvedValue(1);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      // Arrange
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await AuthService.login('test@example.com', 'password123', '127.0.0.1');

      // Assert
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.user.email).toBe('test@example.com');
      expect(result.tokens.accessToken).toBe('mock-access-token');

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword123');
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockUser.lastLogin).toBe(mockDate);
      expect(mockUser.loginAttempts).toBe(0);
    });

    it('should throw error when user not found', async () => {
      // Arrange
      (User.findOne as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        AuthService.login('nonexistent@example.com', 'password123', '127.0.0.1')
      ).rejects.toThrow('Invalid email or password');

      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw error when account is inactive', async () => {
      // Arrange
      mockUser.isActive = false;
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      // Act & Assert
      await expect(
        AuthService.login('test@example.com', 'password123', '127.0.0.1')
      ).rejects.toThrow('Account is deactivated');
    });

    it('should throw error when password is incorrect', async () => {
      // Arrange
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(
        AuthService.login('test@example.com', 'wrongpassword', '127.0.0.1')
      ).rejects.toThrow('Invalid email or password');

      expect(mockUser.loginAttempts).toBe(1);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should lock account after 5 failed attempts', async () => {
      // Arrange
      mockUser.loginAttempts = 4;
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(
        AuthService.login('test@example.com', 'wrongpassword', '127.0.0.1')
      ).rejects.toThrow('Account is temporarily locked');

      expect(mockUser.loginAttempts).toBe(5);
      expect(mockUser.isLocked).toBe(true);
      expect(mockUser.lockUntil).toBeDefined();
      expect(mockUser.save).toHaveBeenCalled();

      // Calculate expected lock time (15 minutes from now)
      const expectedLockUntil = new Date(mockDate.getTime() + 15 * 60 * 1000);
      expect(mockUser.lockUntil).toEqual(expectedLockUntil);
    });

    it('should prevent login when account is locked', async () => {
      // Arrange
      mockUser.isLocked = true;
      mockUser.lockUntil = new Date(mockDate.getTime() + 5 * 60 * 1000); // Locked for 5 more minutes
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      // Act & Assert
      await expect(
        AuthService.login('test@example.com', 'password123', '127.0.0.1')
      ).rejects.toThrow('Account is temporarily locked');

      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should auto-unlock account after lock period expires', async () => {
      // Arrange
      mockUser.isLocked = true;
      mockUser.loginAttempts = 5;
      mockUser.lockUntil = new Date(mockDate.getTime() - 5 * 60 * 1000); // Lock expired 5 minutes ago
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await AuthService.login('test@example.com', 'password123', '127.0.0.1');

      // Assert
      expect(result).toBeDefined();
      expect(mockUser.isLocked).toBe(false);
      expect(mockUser.loginAttempts).toBe(0);
      expect(mockUser.lockUntil).toBeNull();
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should track failed login attempts in Redis for distributed rate limiting', async () => {
      // Arrange
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(
        AuthService.login('test@example.com', 'wrongpassword', '127.0.0.1')
      ).rejects.toThrow('Invalid email or password');

      expect(redisClient.setex).toHaveBeenCalledWith(
        expect.stringContaining('failed_login:test@example.com'),
        900,
        expect.any(String)
      );
    });
  });

  describe('register', () => {
    const registerData = {
      email: 'new@example.com',
      password: 'Password123!',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'patient',
    };

    it('should successfully register a new user', async () => {
      // Arrange
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue({
        ...mockUser,
        email: registerData.email,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
      });

      // Act
      const result = await AuthService.register(registerData);

      // Assert
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.user.email).toBe(registerData.email);
      expect(User.findOne).toHaveBeenCalledWith({ email: registerData.email });
      expect(User.create).toHaveBeenCalled();
    });

    it('should throw error if email already exists', async () => {
      // Arrange
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      // Act & Assert
      await expect(AuthService.register(registerData)).rejects.toThrow(
        'User with this email already exists'
      );

      expect(User.create).not.toHaveBeenCalled();
    });

    it('should hash password before saving', async () => {
      // Arrange
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockImplementation((data) => {
        expect(data.password).not.toBe(registerData.password);
        return Promise.resolve(mockUser);
      });

      // Act
      await AuthService.register(registerData);

      // Assert
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: registerData.email,
          password: expect.not.stringMatching(registerData.password),
        })
      );
    });

    it('should send welcome email after registration', async () => {
      // Arrange
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(mockUser);

      // Act
      await AuthService.register(registerData);

      // Assert
      expect(EmailService.sendWelcomeEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.firstName
      );
    });
  });

  describe('logout', () => {
    it('should successfully logout user', async () => {
      // Arrange
      const userId = 'user123';
      const refreshToken = 'valid-refresh-token';

      // Act
      const result = await AuthService.logout(userId, refreshToken);

      // Assert
      expect(result).toBe(true);
      expect(redisClient.del).toHaveBeenCalledWith(`refresh_token:${refreshToken}`);
      expect(redisClient.del).toHaveBeenCalledWith(`user_session:${userId}`);
    });

    it('should handle logout without refresh token', async () => {
      // Arrange
      const userId = 'user123';

      // Act
      const result = await AuthService.logout(userId);

      // Assert
      expect(result).toBe(true);
      expect(redisClient.del).toHaveBeenCalledWith(`user_session:${userId}`);
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh tokens', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token';
      const userId = 'user123';

      (redisClient.get as jest.Mock).mockResolvedValue(userId);
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await AuthService.refreshToken(refreshToken);

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(TokenService.generateTokens).toHaveBeenCalledWith(mockUser);
      expect(redisClient.del).toHaveBeenCalledWith(`refresh_token:${refreshToken}`);
    });

    it('should throw error for invalid refresh token', async () => {
      // Arrange
      const refreshToken = 'invalid-token';
      (redisClient.get as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(AuthService.refreshToken(refreshToken)).rejects.toThrow('Invalid refresh token');
    });

    it('should throw error if user not found', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token';
      const userId = 'user123';

      (redisClient.get as jest.Mock).mockResolvedValue(userId);
      (User.findById as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(AuthService.refreshToken(refreshToken)).rejects.toThrow('User not found');
    });
  });

  describe('requestPasswordReset', () => {
    it('should send password reset email', async () => {
      // Arrange
      const email = 'test@example.com';
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      // Act
      await AuthService.requestPasswordReset(email);

      // Assert
      expect(EmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.firstName,
        expect.any(String)
      );
      expect(redisClient.setex).toHaveBeenCalledWith(
        expect.stringContaining('reset_token:'),
        3600,
        mockUser._id
      );
    });

    it('should not throw error if email not found (security through obscurity)', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      (User.findOne as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(AuthService.requestPasswordReset(email)).resolves.not.toThrow();
      expect(EmailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('should rate limit password reset requests', async () => {
      // Arrange
      const email = 'test@example.com';
      (redisClient.get as jest.Mock).mockResolvedValue('3'); // 3 attempts already

      // Act & Assert
      await expect(AuthService.requestPasswordReset(email)).rejects.toThrow(
        'Too many password reset requests'
      );
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset password', async () => {
      // Arrange
      const token = 'valid-token';
      const newPassword = 'NewPassword123!';
      const userId = 'user123';

      (redisClient.get as jest.Mock).mockResolvedValue(userId);
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await AuthService.resetPassword(token, newPassword);

      // Assert
      expect(result).toBe(true);
      expect(mockUser.password).toBeDefined();
      expect(mockUser.save).toHaveBeenCalled();
      expect(redisClient.del).toHaveBeenCalledWith(`reset_token:${token}`);
    });

    it('should throw error for invalid token', async () => {
      // Arrange
      const token = 'invalid-token';
      const newPassword = 'NewPassword123!';

      (redisClient.get as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(AuthService.resetPassword(token, newPassword)).rejects.toThrow(
        'Invalid or expired reset token'
      );
    });

    it('should throw error if user not found', async () => {
      // Arrange
      const token = 'valid-token';
      const newPassword = 'NewPassword123!';
      const userId = 'user123';

      (redisClient.get as jest.Mock).mockResolvedValue(userId);
      (User.findById as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(AuthService.resetPassword(token, newPassword)).rejects.toThrow('User not found');
    });
  });

  describe('verifyEmail', () => {
    it('should successfully verify email', async () => {
      // Arrange
      const token = 'valid-verification-token';
      const userId = 'user123';

      (redisClient.get as jest.Mock).mockResolvedValue(userId);
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await AuthService.verifyEmail(token);

      // Assert
      expect(result).toBe(true);
      expect(mockUser.isEmailVerified).toBe(true);
      expect(mockUser.save).toHaveBeenCalled();
      expect(redisClient.del).toHaveBeenCalledWith(`verify_email:${token}`);
    });

    it('should throw error for invalid verification token', async () => {
      // Arrange
      const token = 'invalid-token';
      (redisClient.get as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(AuthService.verifyEmail(token)).rejects.toThrow(
        'Invalid or expired verification token'
      );
    });
  });

  describe('changePassword', () => {
    it('should successfully change password', async () => {
      // Arrange
      const userId = 'user123';
      const currentPassword = 'CurrentPass123!';
      const newPassword = 'NewPass123!';

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await AuthService.changePassword(userId, currentPassword, newPassword);

      // Assert
      expect(result).toBe(true);
      expect(mockUser.password).toBeDefined();
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw error if current password is incorrect', async () => {
      // Arrange
      const userId = 'user123';
      const currentPassword = 'WrongPass123!';
      const newPassword = 'NewPass123!';

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(
        AuthService.changePassword(userId, currentPassword, newPassword)
      ).rejects.toThrow('Current password is incorrect');
    });

    it('should throw error if new password is same as old', async () => {
      // Arrange
      const userId = 'user123';
      const currentPassword = 'CurrentPass123!';
      const newPassword = 'CurrentPass123!'; // Same as current

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act & Assert
      await expect(
        AuthService.changePassword(userId, currentPassword, newPassword)
      ).rejects.toThrow('New password must be different from current password');
    });
  });

  describe('getLoginHistory', () => {
    it('should return user login history', async () => {
      // Arrange
      const userId = 'user123';
      const mockHistory = [
        { timestamp: mockDate, ip: '127.0.0.1', userAgent: 'Chrome' },
        { timestamp: mockDate, ip: '192.168.1.1', userAgent: 'Firefox' },
      ];

      (redisClient.lrange as jest.Mock).mockResolvedValue(
        mockHistory.map((h) => JSON.stringify(h))
      );

      // Act
      const result = await AuthService.getLoginHistory(userId, 10);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('ip');
      expect(result[0]).toHaveProperty('userAgent');
      expect(redisClient.lrange).toHaveBeenCalledWith(`login_history:${userId}`, 0, 9);
    });
  });

  describe('isAccountLocked', () => {
    it('should return true for locked account', async () => {
      // Arrange
      const userId = 'user123';
      mockUser.isLocked = true;
      mockUser.lockUntil = new Date(mockDate.getTime() + 5 * 60 * 1000);

      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await AuthService.isAccountLocked(userId);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for unlocked account', async () => {
      // Arrange
      const userId = 'user123';
      mockUser.isLocked = false;

      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await AuthService.isAccountLocked(userId);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false if lock has expired', async () => {
      // Arrange
      const userId = 'user123';
      mockUser.isLocked = true;
      mockUser.lockUntil = new Date(mockDate.getTime() - 5 * 60 * 1000); // Expired

      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await AuthService.isAccountLocked(userId);

      // Assert
      expect(result).toBe(false);
    });

    it('should throw error if user not found', async () => {
      // Arrange
      const userId = 'nonexistent';
      (User.findById as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(AuthService.isAccountLocked(userId)).rejects.toThrow('User not found');
    });
  });

  describe('unlockAccount', () => {
    it('should successfully unlock account', async () => {
      // Arrange
      const userId = 'user123';
      mockUser.isLocked = true;
      mockUser.lockUntil = new Date();
      mockUser.loginAttempts = 5;

      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await AuthService.unlockAccount(userId, 'admin');

      // Assert
      expect(result).toBe(true);
      expect(mockUser.isLocked).toBe(false);
      expect(mockUser.lockUntil).toBeNull();
      expect(mockUser.loginAttempts).toBe(0);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      // Arrange
      const userId = 'nonexistent';
      (User.findById as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(AuthService.unlockAccount(userId, 'admin')).rejects.toThrow('User not found');
    });
  });
});
