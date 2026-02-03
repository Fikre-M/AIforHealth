import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@/types';
import { User } from '@/models';
import { ResponseUtil, asyncHandler } from '@/utils';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Restrict to admin role
router.use(authorize(UserRole.ADMIN));

// Get all users
router.get('/users', asyncHandler(async (req, res) => {
  const users = await User.find({}, '-password').sort({ createdAt: -1 });
  ResponseUtil.success(res, { users }, 'Users retrieved successfully');
}));

// Get all doctors
router.get('/doctors', asyncHandler(async (req, res) => {
  const doctors = await User.find({ role: UserRole.DOCTOR }, '-password').sort({ createdAt: -1 });
  ResponseUtil.success(res, { doctors }, 'Doctors retrieved successfully');
}));

// Get system analytics (placeholder)
router.get('/analytics', asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalPatients = await User.countDocuments({ role: UserRole.PATIENT });
  const totalDoctors = await User.countDocuments({ role: UserRole.DOCTOR });
  const totalAdmins = await User.countDocuments({ role: UserRole.ADMIN });

  const analytics = {
    users: {
      total: totalUsers,
      patients: totalPatients,
      doctors: totalDoctors,
      admins: totalAdmins
    },
    // Add more analytics as needed
    appointments: {
      total: 0, // Would need to query appointments collection
      scheduled: 0,
      completed: 0,
      cancelled: 0
    }
  };

  ResponseUtil.success(res, { analytics }, 'Analytics retrieved successfully');
}));

export default router;