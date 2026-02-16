// backend/src/routes/doctorRoutes.ts
import { Router } from "express";
import * as doctorController from "../controllers/doctorController";
import { authenticate, authorize } from "../middleware/auth";
import { UserRole } from "../types";

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Restrict to doctor role
router.use(authorize(UserRole.DOCTOR));

// Doctor statistics
router.get("/stats", doctorController.getDoctorStats);

// Doctor appointment endpoints
router.get("/appointments/daily", doctorController.getDailyAppointments);
router.get("/appointments/upcoming", doctorController.getUpcomingAppointments);

// Doctor patient endpoints (specific routes before parameterized routes)
router.get("/patients/summaries", doctorController.getPatientSummaries);
router.get("/patients", doctorController.getPatientList);
router.post("/patients", doctorController.createPatient);
router.get("/patients/:patientId", doctorController.getPatient);
router.patch("/patients/:patientId", doctorController.updatePatient);

export default router;
