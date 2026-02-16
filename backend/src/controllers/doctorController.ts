import { Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import { UserRole } from "../types";
import { DoctorService } from "../services/DoctorService";

/**
 * @route   GET /api/doctors/appointments/daily
 * @desc    Get today's appointments for the doctor
 * @access  Private/Doctor
 */
export const getDailyAppointments = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    if (req.user.role !== UserRole.DOCTOR) {
      res.status(403).json({
        success: false,
        message: "Access denied. Doctor role required.",
      });
      return;
    }

    const appointments = await DoctorService.getDailyAppointments(req.user.userId);

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  }
);

/**
 * @route   GET /api/doctors/appointments/upcoming
 * @desc    Get upcoming appointments
 * @access  Private/Doctor
 */
export const getUpcomingAppointments = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    if (req.user.role !== UserRole.DOCTOR) {
      res.status(403).json({
        success: false,
        message: "Access denied. Doctor role required.",
      });
      return;
    }

    const { limit = "10", page = "1" } = req.query;

    const result = await DoctorService.getUpcomingAppointments(req.user.userId, {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10)
    });

    res.status(200).json({
      success: true,
      count: result.appointments.length,
      total: result.pagination.total,
      data: result.appointments,
      pagination: result.pagination,
    });
  }
);

/**
 * @route   GET /api/doctors/patients
 * @desc    Get list of patients for the doctor
 * @access  Private/Doctor
 */
export const getPatientList = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    if (req.user.role !== UserRole.DOCTOR) {
      res.status(403).json({
        success: false,
        message: "Access denied. Doctor role required.",
      });
      return;
    }

    const { page = "1", limit = "10", search } = req.query;

    const result = await DoctorService.getPatientsList(req.user.userId, {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      search: search as string
    });

    res.status(200).json({
      success: true,
      patients: result.patients,
      total: result.pagination.total,
      pagination: result.pagination,
    });
  }
);

/**
 * @route   GET /api/doctors/patients/summaries
 * @desc    Get patient summaries for quick reference
 * @access  Private/Doctor
 */
export const getPatientSummaries = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    if (req.user.role !== UserRole.DOCTOR) {
      res.status(403).json({
        success: false,
        message: "Access denied. Doctor role required.",
      });
      return;
    }

    const summaries = await DoctorService.getPatientSummaries(req.user.userId);

    res.status(200).json({
      success: true,
      count: summaries.length,
      data: summaries,
    });
  }
);

/**
 * @route   GET /api/doctors/patients/:patientId
 * @desc    Get patient details
 * @access  Private/Doctor
 */
export const getPatient = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    if (req.user.role !== UserRole.DOCTOR) {
      res.status(403).json({
        success: false,
        message: "Access denied. Doctor role required.",
      });
      return;
    }

    const { patientId } = req.params;

    const patient = await DoctorService.getPatientDetails(req.user.userId, patientId);

    if (!patient) {
      res.status(404).json({
        success: false,
        message: "Patient not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: patient,
    });
  }
);

/**
 * @route   POST /api/doctors/patients
 * @desc    Create a new patient
 * @access  Private/Doctor
 */
export const createPatient = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    if (req.user.role !== UserRole.DOCTOR) {
      res.status(403).json({
        success: false,
        message: "Access denied. Doctor role required.",
      });
      return;
    }

    const patient = await DoctorService.createPatient(req.user.userId, req.body);

    res.status(201).json({
      success: true,
      message: "Patient created successfully",
      data: patient,
    });
  }
);

/**
 * @route   PATCH /api/doctors/patients/:patientId
 * @desc    Update patient information
 * @access  Private/Doctor
 */
export const updatePatient = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    if (req.user.role !== UserRole.DOCTOR) {
      res.status(403).json({
        success: false,
        message: "Access denied. Doctor role required.",
      });
      return;
    }

    const { patientId } = req.params;

    const patient = await DoctorService.updatePatient(req.user.userId, patientId, req.body);

    if (!patient) {
      res.status(404).json({
        success: false,
        message: "Patient not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Patient updated successfully",
      data: patient,
    });
  }
);

/**
 * @route   GET /api/doctors/stats
 * @desc    Get doctor statistics
 * @access  Private/Doctor
 */
export const getDoctorStats = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    if (req.user.role !== UserRole.DOCTOR) {
      res.status(403).json({
        success: false,
        message: "Access denied. Doctor role required.",
      });
      return;
    }

    const stats = await DoctorService.getDoctorStats(req.user.userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  }
);