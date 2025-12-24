import { Router } from 'express';
import { UserController } from '@/controllers';
import { ValidationUtil } from '@/utils';
import { authenticate, authorize, ownerOrAdmin } from '@/middleware/auth';
import { UserRole } from '@/types';

const router = Router();

// Public user routes (for registration, handled by auth routes)

// Protected user routes (require authentication)
router.use(authenticate); // All routes below require authentication

// Admin-only routes
router.get('/', authorize(UserRole.ADMIN), UserController.getUsers);
router.get('/stats', authorize(UserRole.ADMIN), UserController.getUserStats);

// User-specific routes (owner or admin can access)
router.get('/:id', ownerOrAdmin, UserController.getUserById);
router.put('/:id', ownerOrAdmin, ValidationUtil.validateUserProfileUpdate(), UserController.updateUser);
router.delete('/:id', authorize(UserRole.ADMIN), UserController.deleteUser); // Only admin can delete

// User-specific actions (owner or admin can access)
router.put('/:id/password', ownerOrAdmin, ValidationUtil.validatePasswordUpdate(), UserController.updatePassword);
router.put('/:id/verify-email', ownerOrAdmin, UserController.verifyEmail);

export default router;