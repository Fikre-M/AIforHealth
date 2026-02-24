import { Router } from 'express';
import * as healthController from '../controllers/healthController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@/types';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Health management endpoints (medications, reminders, metrics)
 */

// Validation for medication
const validateMedication = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Medication name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Medication name must be between 2 and 100 characters'),
  
  body('dosage')
    .trim()
    .notEmpty()
    .withMessage('Dosage is required')
    .isLength({ max: 50 })
    .withMessage('Dosage cannot exceed 50 characters'),
  
  body('frequency')
    .trim()
    .notEmpty()
    .withMessage('Frequency is required')
    .isLength({ max: 50 })
    .withMessage('Frequency cannot exceed 50 characters'),
  
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format')
    .custom((value, { req }) => {
      if (value && req.body.startDate && new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Validation for health reminder
const validateHealthReminder = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Reminder title is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('reminderDate')
    .notEmpty()
    .withMessage('Reminder date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('type')
    .optional()
    .isIn(['medication', 'appointment', 'checkup', 'other'])
    .withMessage('Invalid reminder type'),
  
  handleValidationErrors
];

// Validation for health metric
const validateHealthMetric = [
  body('type')
    .notEmpty()
    .withMessage('Metric type is required')
    .isIn(['blood_pressure', 'heart_rate', 'temperature', 'weight', 'height', 'blood_sugar', 'oxygen_saturation'])
    .withMessage('Invalid metric type'),
  
  body('value')
    .notEmpty()
    .withMessage('Metric value is required'),
  
  body('unit')
    .notEmpty()
    .withMessage('Unit is required')
    .isLength({ max: 20 })
    .withMessage('Unit cannot exceed 20 characters'),
  
  body('recordedAt')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  
  handleValidationErrors
];

// Medication endpoints
router.get('/medications', healthController.getMedications);
router.post('/medications', authorize(UserRole.DOCTOR, UserRole.ADMIN), ...validateMedication, healthController.createMedication);
router.get('/medications/:id', healthController.getMedicationById);
router.put('/medications/:id', authorize(UserRole.DOCTOR, UserRole.ADMIN), ...validateMedication, healthController.updateMedication);
router.delete('/medications/:id', authorize(UserRole.DOCTOR, UserRole.ADMIN), healthController.deleteMedication);

// Health reminder endpoints
router.get('/reminders', healthController.getHealthReminders);
router.post('/reminders', ...validateHealthReminder, healthController.createHealthReminder);
router.get('/reminders/:id', healthController.getHealthReminderById);
router.put('/reminders/:id', ...validateHealthReminder, healthController.updateHealthReminder);
router.patch('/reminders/:id/complete', healthController.markReminderComplete);
router.delete('/reminders/:id', healthController.deleteHealthReminder);

// Health metrics endpoints
router.get('/metrics', healthController.getHealthMetrics);
router.post('/metrics', ...validateHealthMetric, healthController.createHealthMetric);
router.get('/metrics/:id', healthController.getHealthMetricById);
router.put('/metrics/:id', ...validateHealthMetric, healthController.updateHealthMetric);
router.delete('/metrics/:id', healthController.deleteHealthMetric);

export default router;