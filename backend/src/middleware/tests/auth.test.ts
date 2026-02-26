import { Request, Response, NextFunction } from "express";
import { authenticate, authorize, requireAuth } from "../auth";
import { TokenService } from "@/services/TokenService";
import { User } from "@/models/User";
import { redisClient } from "@/config/redis";
import { AppError } from "@/middleware/errorHandler";

jest.mock("@/services/TokenService");
jest.mock("@/models/User");
jest.mock("@/config/redis");

describe("Auth Middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockReq = {
      headers: {},
      ip: "127.0.0.1",
      path: "/api/test",
      method: "GET",
    };
    mockRes = {
      locals: {},
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe("authenticate", () => {
    it("should authenticate user with valid token", async () => {
      // Arrange
      const token = "valid-token";
      mockReq.headers = { authorization: "Bearer valid-token" };

      const mockDecoded = { userId: "user123" };
      (TokenService.verifyAccessToken as jest.Mock).mockResolvedValue(
        mockDecoded,
      );

      const mockUser = { _id: "user123", isActive: true };
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      (redisClient.get as jest.Mock).mockResolvedValue("active");

      // Act
      await authenticate(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockReq.user).toBeDefined();
      expect(mockReq.user?._id).toBe("user123");
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should return 401 if no token provided", async () => {
      // Act
      await authenticate(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockNext.mock.calls[0][0].statusCode).toBe(401);
      expect(mockNext.mock.calls[0][0].message).toBe("No token provided");
    });

    it("should return 401 if token is invalid", async () => {
      // Arrange
      mockReq.headers = { authorization: "Bearer invalid-token" };
      (TokenService.verifyAccessToken as jest.Mock).mockRejectedValue(
        new Error("Invalid token"),
      );

      // Act
      await authenticate(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockNext.mock.calls[0][0].statusCode).toBe(401);
    });

    it("should return 401 if user not found", async () => {
      // Arrange
      mockReq.headers = { authorization: "Bearer valid-token" };
      (TokenService.verifyAccessToken as jest.Mock).mockResolvedValue({
        userId: "user123",
      });
      (User.findById as jest.Mock).mockResolvedValue(null);

      // Act
      await authenticate(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockNext.mock.calls[0][0].statusCode).toBe(401);
    });

    it("should return 401 if user is inactive", async () => {
      // Arrange
      mockReq.headers = { authorization: "Bearer valid-token" };
      (TokenService.verifyAccessToken as jest.Mock).mockResolvedValue({
        userId: "user123",
      });
      (User.findById as jest.Mock).mockResolvedValue({
        _id: "user123",
        isActive: false,
      });

      // Act
      await authenticate(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockNext.mock.calls[0][0].statusCode).toBe(401);
    });

    it("should check if token is blacklisted", async () => {
      // Arrange
      mockReq.headers = { authorization: "Bearer valid-token" };
      (TokenService.verifyAccessToken as jest.Mock).mockResolvedValue({
        userId: "user123",
      });
      (User.findById as jest.Mock).mockResolvedValue({
        _id: "user123",
        isActive: true,
      });
      (redisClient.get as jest.Mock).mockResolvedValue("blacklisted");

      // Act
      await authenticate(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockNext.mock.calls[0][0].statusCode).toBe(401);
    });
  });

  describe("authorize", () => {
    it("should allow access for user with required role", async () => {
      // Arrange
      mockReq.user = { role: "admin" } as any;
      const middleware = authorize(["admin", "doctor"]);

      // Act
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should deny access for user without required role", async () => {
      // Arrange
      mockReq.user = { role: "patient" } as any;
      const middleware = authorize(["admin", "doctor"]);

      // Act
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockNext.mock.calls[0][0].statusCode).toBe(403);
    });

    it("should return 401 if no user in request", async () => {
      // Arrange
      const middleware = authorize(["admin"]);

      // Act
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockNext.mock.calls[0][0].statusCode).toBe(401);
    });
  });

  describe("requireAuth", () => {
    it("should allow access for authenticated user", async () => {
      // Arrange
      mockReq.isAuthenticated = true;

      // Act
      requireAuth(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should deny access for unauthenticated user", async () => {
      // Arrange
      mockReq.isAuthenticated = false;

      // Act
      requireAuth(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockNext.mock.calls[0][0].statusCode).toBe(401);
    });
  });
});
