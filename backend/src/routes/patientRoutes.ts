import { Router } from 'express';
import { patientValidators } from '@/middleware/validators/patient.validators';
import { PatientController } from '@/controllers/patientController';
import { authenticate, authorize } from '@/middleware/auth';
import { UserRole } from '@/types';

const router = Router();

// ✅ CREATE Patient - Complex validation in action
router.post(
  '/',
  authenticate,
  authorize(UserRole.DOCTOR, UserRole.ADMIN),
  patientValidators.create, // <-- Validates ALL patient fields (name, DOB, address, medical history, etc.)
  PatientController.create
);

// ✅ UPDATE Patient
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.DOCTOR, UserRole.ADMIN, UserRole.PATIENT),
  patientValidators.update, // <-- Validates update fields
  PatientController.update
);

// ✅ GET Patient with Pagination
router.get(
  '/',
  authenticate,
  authorize(UserRole.DOCTOR, UserRole.ADMIN),
  patientValidators.list, // <-- Validates pagination: page, limit, sortBy, sortOrder
  PatientController.list
);

export default router;

// // backend/src/routes/patientRoutes.ts
// import { Router } from "express";
// import * as patientController from "../controllers/patientController";
// import { authenticate, authorize } from "../middleware/auth";
// import { UserRole } from "@/types";

// const router = Router();

// // Apply authentication to all routes
// router.use(authenticate);

// // Restrict to patient role
// router.use(authorize(UserRole.PATIENT));

// // Patient notification endpoints
// router.get("/notifications", patientController.getPatientNotifications);
// router.patch(
//   "/notifications/:notificationId/read",
//   patientController.markNotificationAsRead
// );

// export default router;
