// backend/src/routes/patientRoutes.ts
import { Router } from "express";
import * as patientController from "../controllers/patientController";
import { authenticate, authorize } from "../middleware/auth";
import { UserRole } from "@/types";

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Restrict to patient role
router.use(authorize(UserRole.PATIENT));

// Patient appointment endpoints
router.get("/appointments/upcoming", patientController.getUpcomingAppointments);
router.get("/appointments/history", patientController.getAppointmentHistory);

// Patient notification endpoints
router.get("/notifications", patientController.getPatientNotifications);
router.patch(
  "/notifications/:notificationId/read",
  patientController.markNotificationAsRead
);

export default router;
