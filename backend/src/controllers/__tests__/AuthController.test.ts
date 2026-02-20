import { AuthController } from '../AuthController';
import { AuthService } from '@/services/AuthService';
import { mockRequest, mockResponse, mockNext } from '@/test/helpers';

// Mock AuthService
jest.mock('@/services/AuthService');

describe('AuthController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'patient',
      };
      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      (AuthService.register as jest.Mock).mockResolvedValue({
        user: mockUser,
        tokens: mockTokens,
      });

      const req = mockRequest({
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123!',
          role: 'patient',
        },
      });
      const res = mockResponse();

      await AuthController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            user: mockUser,
            tokens: mockTokens,
          }),
        })
      );
    });

    it('should handle registration errors', async () => {
      (AuthService.register as jest.Mock).mockRejectedValue(
        new Error('Email already exists')
      );

      const req = mockRequest({
        body: {
          name: 'Test User',
          email: 'existing@example.com',
          password: 'Password123!',
        },
      });
      const res = mockResponse();

      await AuthController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        })
      );
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'patient',
      };
      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      (AuthService.login as jest.Mock).mockResolvedValue({
        user: mockUser,
        tokens: mockTokens,
      });

      const req = mockRequest({
        body: {
          email: 'test@example.com',
          password: 'Password123!',
        },
      });
      const res = mockResponse();

      await AuthController.login(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            user: mockUser,
            tokens: mockTokens,
          }),
        })
      );
    });

    it('should set HTTP-only cookies', async () => {
      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      (AuthService.login as jest.Mock).mockResolvedValue({
        user: { _id: '123', email: 'test@example.com' },
        tokens: mockTokens,
      });

      const req = mockRequest({
        body: { email: 'test@example.com', password: 'Password123!' },
      });
      const res = mockResponse();
      res.cookie = jest.fn().mockReturnValue(res);

      await AuthController.login(req, res);

      expect(res.cookie).toHaveBeenCalledWith(
        'accessToken',
        mockTokens.accessToken,
        expect.objectContaining({ httpOnly: true })
      );
      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        mockTokens.refreshToken,
        expect.objectContaining({ httpOnly: true })
      );
    });

    it('should handle invalid credentials', async () => {
      (AuthService.login as jest.Mock).mockRejectedValue(
        new Error('Invalid email or password')
      );

      const req = mockRequest({
        body: { email: 'test@example.com', password: 'wrong' },
      });
      const res = mockResponse();

      await AuthController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'patient',
      };

      (AuthService.getProfile as jest.Mock).mockResolvedValue(mockUser);

      const req = mockRequest({
        user: { userId: '123', role: 'patient' },
      });
      const res = mockResponse();

      await AuthController.getProfile(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockUser,
        })
      );
    });

    it('should return 401 if not authenticated', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await AuthController.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      (AuthService.changePassword as jest.Mock).mockResolvedValue(true);

      const req = mockRequest({
        user: { userId: '123' },
        body: {
          currentPassword: 'OldPassword123!',
          newPassword: 'NewPassword123!',
        },
      });
      const res = mockResponse();

      await AuthController.changePassword(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Password changed successfully',
        })
      );
    });

    it('should handle incorrect current password', async () => {
      (AuthService.changePassword as jest.Mock).mockRejectedValue(
        new Error('Current password is incorrect')
      );

      const req = mockRequest({
        user: { userId: '123' },
        body: {
          currentPassword: 'wrong',
          newPassword: 'NewPassword123!',
        },
      });
      const res = mockResponse();

      await AuthController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
