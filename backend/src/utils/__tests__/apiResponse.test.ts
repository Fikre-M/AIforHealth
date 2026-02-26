import { Response } from "express";
import { ResponseUtil, ApiResponse } from "../apiResponse";

describe("ResponseUtil", () => {
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });

    mockRes = {
      status: mockStatus,
      json: mockJson,
      locals: {
        requestId: "test-request-id",
        startTime: Date.now() - 100,
      },
    } as Partial<Response>;
  });

  describe("success", () => {
    it("should return success response with data", () => {
      // Arrange
      const data = { id: 1, name: "Test" };
      const message = "Success message";

      // Act
      ResponseUtil.success(mockRes as Response, data, message);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data,
          message,
          meta: expect.objectContaining({
            timestamp: expect.any(String),
            requestId: "test-request-id",
          }),
        }),
      );
    });

    it("should use custom status code", () => {
      // Arrange
      const data = { id: 1 };

      // Act
      ResponseUtil.success(mockRes as Response, data, "Created", 201);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(201);
    });

    it("should include response time in meta", () => {
      // Act
      ResponseUtil.success(mockRes as Response, {}, "Success");

      // Assert
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          meta: expect.objectContaining({
            responseTime: expect.any(Number),
          }),
        }),
      );
    });
  });

  describe("error", () => {
    it("should return error response with message", () => {
      // Arrange
      const message = "Error occurred";

      // Act
      ResponseUtil.error(mockRes as Response, message, 400);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message,
          meta: expect.objectContaining({
            timestamp: expect.any(String),
          }),
        }),
      );
    });

    it("should format array errors correctly", () => {
      // Arrange
      const errors = [
        { field: "email", message: "Invalid email" },
        { field: "password", message: "Too short" },
      ];

      // Act
      ResponseUtil.error(mockRes as Response, "Validation failed", 400, errors);

      // Assert
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: errors,
        }),
      );
    });

    it("should format Error object correctly", () => {
      // Arrange
      const error = new Error("Database connection failed");
      error.name = "ConnectionError";

      // Act
      ResponseUtil.error(mockRes as Response, "Server error", 500, error);

      // Assert
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: [
            { message: "Database connection failed", code: "ConnectionError" },
          ],
        }),
      );
    });

    it("should format string error correctly", () => {
      // Act
      ResponseUtil.error(
        mockRes as Response,
        "Error",
        400,
        "Something went wrong",
      );

      // Assert
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: [{ message: "Something went wrong" }],
        }),
      );
    });
  });

  describe("paginated", () => {
    it("should return paginated response with correct structure", () => {
      // Arrange
      const data = [{ id: 1 }, { id: 2 }];
      const pagination = {
        page: 2,
        limit: 10,
        total: 25,
        sortBy: "createdAt",
        sortOrder: "desc" as const,
      };

      // Act
      ResponseUtil.paginated(mockRes as Response, data, pagination, "Success");

      // Assert
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data,
          pagination: {
            page: 2,
            limit: 10,
            total: 25,
            pages: 3,
            hasNext: true,
            hasPrev: true,
          },
          meta: expect.objectContaining({
            sortBy: "createdAt",
            sortOrder: "desc",
          }),
        }),
      );
    });

    it("should calculate hasNext and hasPrev correctly", () => {
      // Test first page
      ResponseUtil.paginated(mockRes as Response, [], {
        page: 1,
        limit: 10,
        total: 25,
      });
      expect(mockJson.mock.calls[0][0].pagination).toEqual(
        expect.objectContaining({ hasNext: true, hasPrev: false }),
      );

      // Test last page
      ResponseUtil.paginated(mockRes as Response, [], {
        page: 3,
        limit: 10,
        total: 25,
      });
      expect(mockJson.mock.calls[1][0].pagination).toEqual(
        expect.objectContaining({ hasNext: false, hasPrev: true }),
      );
    });
  });

  describe("convenience methods", () => {
    it("created should return 201 response", () => {
      // Act
      ResponseUtil.created(
        mockRes as Response,
        { id: 1 },
        "Created",
        "/api/resource/1",
      );

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockRes.location).toBeDefined();
    });

    it("notFound should return 404 response", () => {
      // Act
      ResponseUtil.notFound(mockRes as Response, "User");

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User not found",
        }),
      );
    });

    it("unauthorized should return 401 response", () => {
      // Act
      ResponseUtil.unauthorized(mockRes as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(401);
    });

    it("forbidden should return 403 response", () => {
      // Act
      ResponseUtil.forbidden(mockRes as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(403);
    });

    it("conflict should return 409 response", () => {
      // Act
      ResponseUtil.conflict(mockRes as Response, "Email already exists");

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(409);
    });

    it("tooManyRequests should set Retry-After header", () => {
      // Act
      ResponseUtil.tooManyRequests(
        mockRes as Response,
        "Too many requests",
        60,
      );

      // Assert
      expect(mockRes.setHeader).toHaveBeenCalledWith("Retry-After", 60);
      expect(mockStatus).toHaveBeenCalledWith(429);
    });

    it("noContent should return 204 without body", () => {
      // Act
      ResponseUtil.noContent(mockRes as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(204);
      expect(mockJson).not.toHaveBeenCalled();
    });
  });

  describe("validationError", () => {
    it("should format express-validator errors correctly", () => {
      // Arrange
      const errors = [
        { param: "email", msg: "Invalid email", value: "test" },
        { param: "password", msg: "Too short", value: "123" },
      ];

      // Act
      ResponseUtil.validationError(mockRes as Response, errors as any);

      // Assert
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Validation failed",
          errors: [
            {
              field: "email",
              message: "Invalid email",
              value: "test",
              code: "VALIDATION_ERROR",
            },
            {
              field: "password",
              message: "Too short",
              value: "123",
              code: "VALIDATION_ERROR",
            },
          ],
        }),
      );
    });
  });
});
