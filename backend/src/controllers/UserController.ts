import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { UserService } from '@/services';
import { ResponseUtil, asyncHandler } from '@/utils';
import { UserRole } from '@/types';

/**
 * User controller for handling user-related HTTP requests
 */
export class UserController {
  /**
   * Create a new user
   */
  static createUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      ResponseUtil.error(res, 'Validation failed', 400, { errors: errors.array() });
      return;
    }

    const { name, email, password, role } = req.body;

    const user = await UserService.createUser({
      name,
      email,
      password,
      role: role || UserRole.PATIENT,
    });

    ResponseUtil.success(res, user, 'User created successfully', 201);
  });

  /**
   * Get user by ID
   */
  static getUserById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const user = await UserService.findUserById(id);
    if (!user) {
      ResponseUtil.error(res, 'User not found', 404);
      return;
    }

    ResponseUtil.success(res, user, 'User retrieved successfully');
  });

  /**
   * Get all users with pagination and filtering
   */
  static getUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const {
      page = 1,
      limit = 10,
      role,
      isActive,
      search,
      sortBy,
      sortOrder,
    } = req.query;

    const result = await UserService.getUsers({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      role: role as UserRole,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      search: search as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
    });

    ResponseUtil.paginated(
      res,
      result.users,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total
    );
  });

  /**
   * Update user by ID
   */
  static updateUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      ResponseUtil.error(res, 'Validation failed', 400, { errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const updateData = req.body;

    const user = await UserService.updateUser(id, updateData);
    if (!user) {
      ResponseUtil.error(res, 'User not found', 404);
      return;
    }

    ResponseUtil.success(res, user, 'User updated successfully');
  });

  /**
   * Delete user by ID (soft delete)
   */
  static deleteUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const deleted = await UserService.deleteUser(id);
    if (!deleted) {
      ResponseUtil.error(res, 'User not found', 404);
      return;
    }

    ResponseUtil.success(res, null, 'User deleted successfully');
  });

  /**
   * Get user statistics
   */
  static getUserStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const stats = await UserService.getUserStats();
    ResponseUtil.success(res, stats, 'User statistics retrieved successfully');
  });

  /**
   * Update user password
   */
  static updatePassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      ResponseUtil.error(res, 'Validation failed', 400, { errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const { newPassword } = req.body;

    const updated = await UserService.updatePassword(id, newPassword);
    if (!updated) {
      ResponseUtil.error(res, 'Failed to update password', 400);
      return;
    }

    ResponseUtil.success(res, null, 'Password updated successfully');
  });

  /**
   * Verify user email
   */
  static verifyEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const verified = await UserService.verifyEmail(id);
    if (!verified) {
      ResponseUtil.error(res, 'Failed to verify email', 400);
      return;
    }

    ResponseUtil.success(res, null, 'Email verified successfully');
  });
}