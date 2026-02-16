import { authenticate, authorize } from '../auth';
import { generateTestToken, mockRequest, mockResponse, mockNext } from '@/test/helpers';

describe('Auth Middleware', () => {
  describe('authenticate', () => {
    it('should authenticate valid token', async () => {
      const userId = '123456789012345678901234';
      const token = generateTestToken(userId, 'patient');
      const req = mockRequest({
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      const res = mockResponse();
      const next = mockNext;

      await authenticate(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.userId).toBe(userId);
    });

    it('should reject request without token', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext;

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('token'),
        })
      );
    });

    it('should reject invalid token', async () => {
      const req = mockRequest({
        headers: {
          authorization: 'Bearer invalid-token',
        },
      });
      const res = mockResponse();
      const next = mockNext;

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        })
      );
    });
  });

  describe('authorize', () => {
    it('should allow access for authorized role', () => {
      const req = mockRequest({
        user: { userId: '123', role: 'admin' },
      });
      const res = mockResponse();
      const next = mockNext;

      const middleware = authorize(['admin', 'doctor']);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should deny access for unauthorized role', () => {
      const req = mockRequest({
        user: { userId: '123', role: 'patient' },
      });
      const res = mockResponse();
      const next = mockNext;

      const middleware = authorize(['admin', 'doctor']);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('permission'),
        })
      );
    });

    it('should deny access when user is not authenticated', () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext;

      const middleware = authorize(['admin']);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});
