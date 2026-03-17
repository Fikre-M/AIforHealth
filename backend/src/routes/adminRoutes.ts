import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@/types';
import { User } from '@/models';
import { ResponseUtil, asyncHandler } from '@/utils';
import { seeder } from '@/utils/seeder';

const router = Router();

// Seed endpoint - accessible via SEED_SECRET (no auth needed) OR admin JWT
// Must be defined BEFORE the authenticate middleware
router.post('/seed', asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const seedSecret = process.env['SEED_SECRET'];

  const isSeedSecret = seedSecret && authHeader === `Bearer ${seedSecret}`;

  if (!isSeedSecret) {
    // Fall through to normal admin auth check below
    // Re-use authenticate + authorize inline
    return authenticate(req, res, async () => {
      return authorize(UserRole.ADMIN)(req, res, async () => {
        await seeder.seed(true);
        ResponseUtil.success(res, null, 'Database seeded successfully');
      });
    });
  }

  await seeder.seed(true);
  ResponseUtil.success(res, null, 'Database seeded successfully');
}));

// All routes below require authentication + admin role
router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

// Get all users
router.get('/users', asyncHandler(async (_req, res) => {
  const users = await User.find({}, '-password').sort({ createdAt: -1 });
  ResponseUtil.success(res, { users }, 'Users retrieved successfully');
}));

// Get all doctors
router.get('/doctors', asyncHandler(async (_req, res) => {
  const doctors = await User.find({ role: UserRole.DOCTOR }, '-password').sort({ createdAt: -1 });
  ResponseUtil.success(res, { doctors }, 'Doctors retrieved successfully');
}));

// Get system analytics
router.get('/analytics', asyncHandler(async (_req, res) => {
  const [totalUsers, totalPatients, totalDoctors, totalAdmins] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: UserRole.PATIENT }),
    User.countDocuments({ role: UserRole.DOCTOR }),
    User.countDocuments({ role: UserRole.ADMIN }),
  ]);

  ResponseUtil.success(res, {
    analytics: {
      users: { total: totalUsers, patients: totalPatients, doctors: totalDoctors, admins: totalAdmins },
      appointments: { total: 0, scheduled: 0, completed: 0, cancelled: 0 },
    },
  }, 'Analytics retrieved successfully');
}));

export default router;
