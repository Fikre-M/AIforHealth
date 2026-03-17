import { Router } from 'express';
import * as clinicController from '../controllers/clinicController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';
import { body, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const router = Router();

// Simple inline validation error handler
const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

const validateClinic = [
  body('name').trim().notEmpty().withMessage('Clinic name is required').isLength({ min: 2, max: 100 }),
  body('address').trim().notEmpty().withMessage('Address is required').isLength({ max: 200 }),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('rating').optional().isFloat({ min: 0, max: 5 }),
  body('specialties').isArray().withMessage('Specialties must be an array'),
  body('isOpen').optional().isBoolean(),
  validate,
];

const validateClinicQuery = [
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('page').optional().isInt({ min: 1 }),
  query('search').optional().isLength({ min: 2, max: 100 }),
  query('specialty').optional().isLength({ min: 2, max: 50 }),
  validate,
];

// Public routes
// Doctor availability MUST come before /:id to avoid route conflict
router.get('/doctors/:doctorId/availability', clinicController.getDoctorAvailability);
router.get('/', validateClinicQuery, clinicController.getClinics);
router.get('/:id', clinicController.getClinicById);
router.get('/:id/doctors', clinicController.getDoctorsByClinic);

// Admin-only routes
router.use(authenticate);
router.post('/', authorize(UserRole.ADMIN), ...validateClinic, clinicController.createClinic);
router.put('/:id', authorize(UserRole.ADMIN), ...validateClinic, clinicController.updateClinic);
router.delete('/:id', authorize(UserRole.ADMIN), clinicController.deleteClinic);

export default router;
