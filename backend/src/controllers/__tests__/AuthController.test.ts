import { Request, Response, NextFunction } from 'express';
import { AuthController } from '../AuthController';
import { AuthService } from '@/services/AuthService';
import { mockRequest, mockResponse } from '@/test/helpers';
import { AppError } from '@/middleware/errorHandler';

jest.mock('@/services/AuthService');

describe('AuthController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = mockResponse();
    next = jest.fn() as NextFunction;
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      const mockUser = { _id: '123', email: 'test@example.com', name: 'Test', role: 'patient' };
      const mockTokens = { accessToken: 'token', refreshToken: 'token' };

      (AuthService.register as jest.Mock).mockResolvedValue({ user: mockUser, tokens: mockTokens });

      req.body = {
        name: 'Test',
        email: 'test@example.com',
        password: 'Password123!',
        role: 'patient',
      };

      await AuthController.register(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: { user: mockUser, tokens: mockTokens } })
      );
    });

    it('should handle registration errors', async () => {
      (AuthService.register as jest.Mock).mockRejectedValue(new AppError('Email exists', 400));

      req.body = {
        name: 'Test',
        email: 'existing@example.com',
        password: 'Password123!',
        role: 'patient',
      };

      await AuthController.register(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });
  });

  describe('login', () => {
    it('should login user and set cookies', async () => {
      const mockTokens = { accessToken: 'a', refreshToken: 'r' };
      const mockUser = { _id: '123', email: 'test@example.com' };

      (AuthService.login as jest.Mock).mockResolvedValue({ user: mockUser, tokens: mockTokens });

      req.body = { email: 'test@example.com', password: 'Password123!' };
      res.cookie = jest.fn().mockReturnValue(res);

      await AuthController.login(req as Request, res as Response, next);

      expect(res.cookie).toHaveBeenCalledWith(
        'accessToken',
        mockTokens.accessToken,
        expect.any(Object)
      );
      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        mockTokens.refreshToken,
        expect.any(Object)
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: { user: mockUser, tokens: mockTokens } })
      );
    });
  });
});
