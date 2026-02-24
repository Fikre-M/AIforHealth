// backend/src/routes/doctorRoutes.ts
import { Router } from "express";
import * as doctorController from "../controllers/doctorController";
import { authenticate, authorize } from "../middleware/auth";
import { UserRole } from "../types";
import { body } from "express-validator";
import { handleValidationErrors } from "../middleware/validation";

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Restrict to doctor role
router.use(authorize(UserRole.DOCTOR));

// Validation middleware for patient creation
const validatePatientCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email cannot exceed 100 characters'),
  
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  
  handleValidationErrors
];

// Validation middleware for patient update
const validatePatientUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  
  body('address')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters'),
  
  body('medicalHistory')
    .optional()
    .isArray()
    .withMessage('Medical history must be an array'),
  
  body('allergies')
    .optional()
    .isArray()
    .withMessage('Allergies must be an array'),
  
  body('currentMedications')
    .optional()
    .isArray()
    .withMessage('Current medications must be an array'),
  
  handleValidationErrors
];

// Doctor statistics
router.get("/stats", doctorController.getDoctorStats);

// Doctor appointment endpoints
router.get("/appointments/daily", doctorController.getDailyAppointments);
router.get("/appointments/upcoming", doctorController.getUpcomingAppointments);

// Doctor patient endpoints (specific routes before parameterized routes)
router.get("/patients/summaries", doctorController.getPatientSummaries);
router.get("/patients", doctorController.getPatientList);
router.post("/patients", ...validatePatientCreation, doctorController.createPatient);
router.get("/patients/:patientId", doctorController.getPatient);
router.patch("/patients/:patientId", ...validatePatientUpdate, doctorController.updatePatient);

export default router;
