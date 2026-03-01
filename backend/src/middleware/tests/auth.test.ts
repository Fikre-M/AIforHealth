import { Request, Response, NextFunction } from 'express';
import { authenticate, authorize, requireAuth } from '../auth';
import { TokenService } from '@/services/TokenService';
import { User } from '@/models/User';
import { redisClient } from '@/config/redis';
import { AppError } from '@/middleware/errorHandler';

jest.mock('@/services/TokenService');
jest.mock('@/models/User');
jest.mock('@/config/redis');

describe('Auth Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    req = { headers: {}, ip: '127.0.0.1', path: '/api/test', method: 'GET' };
    res = { locals: {}, status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should call next if valid token', async () => {
      req.headers.authorization = 'Bearer valid';
      (TokenService.verifyAccessToken as jest.Mock).mockResolvedValue({ userId: 'user123' });
      (User.findById as jest.Mock).mockResolvedValue({ _id: 'user123', isActive: true });
      (redisClient.get as jest.Mock).mockResolvedValue(null);

      await authenticate(req as Request, res as Response, next);

      expect(req.user).toBeDefined();
      expect(next).toHaveBeenCalledWith();
    });

    it('should fail if token missing', async () => {
      await authenticate(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].statusCode).toBe(401);
    });
  });

  describe('authorize', () => {
    it('should allow correct role', async () => {
      req.user = { role: 'admin' };
      const middleware = authorize(['admin']);
      await middleware(req as Request, res as Response, next);
      expect(next).toHaveBeenCalledWith();
    });

    it('should deny incorrect role', async () => {
      req.user = { role: 'patient' };
      const middleware = authorize(['admin']);
      await middleware(req as Request, res as Response, next);
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].statusCode).toBe(403);
    });
  });
});
