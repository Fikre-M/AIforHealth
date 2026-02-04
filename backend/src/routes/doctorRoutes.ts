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

// Doctor appointment endpoints
router.get("/appointments/daily", doctorController.getDailyAppointments);
router.get("/appointments/upcoming", doctorController.getUpcomingAppointments);

// Doctor notification endpoints
// router.get("/notifications", doctorController.getNotifications);

// Doctor patient endpoints
router.get("/patients", doctorController.getPatientList);
// router.post("/patients", doctorController.createPatient);
// router.get("/patients/summaries", doctorController.getPatientSummaries); // Move this before the parameterized route
// router.get("/patients/:patientId", doctorController.getPatient);
// router.patch("/patients/:patientId", doctorController.updatePatient);
// Appointment requests and analytics
// router.get("/appointment-requests", doctorController.getAppointmentRequests);
// router.post("/appointment-requests/:requestId/approve", doctorController.approveAppointmentRequest);
// router.post("/appointment-requests/:requestId/reject", doctorController.rejectAppointmentRequest);

export default router;
