import { Router } from 'express';
import { UserController } from '@/controllers';
import { ValidationUtil } from '@/utils';

const router = Router();

// User CRUD routes
router.post('/', ValidationUtil.validateUserRegistration(), UserController.createUser);
router.get('/', UserController.getUsers);
router.get('/stats', UserController.getUserStats);
router.get('/:id', UserController.getUserById);
router.put('/:id', ValidationUtil.validateUserProfileUpdate(), UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

// User-specific actions
router.put('/:id/password', ValidationUtil.validatePasswordUpdate(), UserController.updatePassword);
router.put('/:id/verify-email', UserController.verifyEmail);

export default router;