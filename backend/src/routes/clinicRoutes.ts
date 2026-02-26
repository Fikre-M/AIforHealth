import { Router } from 'express';
import * as clinicController from '../controllers/clinicController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';
import { body, query } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation';

const router = Router();

// Validation for clinic creation/update
const validateClinic = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Clinic name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Clinic name must be between 2 and 100 characters'),

  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters'),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),

  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),

  body('specialties')
    .isArray()
    .withMessage('Specialties must be an array')
    .custom((specialties) => {
      if (specialties.length === 0) {
        throw new Error('At least one specialty is required');
      }
      return true;
    }),

  body('specialties.*')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Each specialty must be between 2 and 50 characters'),

  body('isOpen').optional().isBoolean().withMessage('isOpen must be a boolean'),

  handleValidationErrors,
];

// Validation for query parameters
const validateClinicQuery = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('search')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search term must be between 2 and 100 characters'),

  query('specialty')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Specialty must be between 2 and 50 characters'),

  handleValidationErrors,
];

/**
 * @swagger
 * tags:
 *   name: Clinics
 *   description: Clinic management endpoints
 */

// Public routes (no authentication required for browsing clinics)
router.get('/', validateClinicQuery, clinicController.getClinics);
router.get('/:id', clinicController.getClinicById);
router.get('/:id/doctors', clinicController.getDoctorsByClinic);

// Protected routes (require authentication)
router.use(authenticate);

// Admin-only routes
router.post('/', authorize(UserRole.ADMIN), ...validateClinic, clinicController.createClinic);
router.put('/:id', authorize(UserRole.ADMIN), ...validateClinic, clinicController.updateClinic);
router.delete('/:id', authorize(UserRole.ADMIN), clinicController.deleteClinic);

export default router;
