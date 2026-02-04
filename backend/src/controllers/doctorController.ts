import { Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import { UserRole } from "../types";

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

    const today = new Date();
    const mockAppointments = [
      {
        id: "apt1",
        patientId: "patient1",
        patientName: "John Doe",
        patientEmail: "john@example.com",
        date: today.toISOString().split('T')[0],
        time: "10:00",
        type: "consultation",
        status: "scheduled",
        reason: "Regular checkup"
      },
      {
        id: "apt2",
        patientId: "patient2",
        patientName: "Jane Smith",
        patientEmail: "jane@example.com",
        date: today.toISOString().split('T')[0],
        time: "14:00",
        type: "follow-up",
        status: "scheduled",
        reason: "Follow-up consultation"
      }
    ];

    res.status(200).json({
      success: true,
      count: mockAppointments.length,
      data: mockAppointments,
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
    const skip = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);

    const mockAppointments = [
      {
        id: "apt1",
        patientId: "patient1",
        patientName: "John Doe",
        patientEmail: "john@example.com",
        date: "2026-02-10",
        time: "10:00",
        type: "consultation",
        status: "scheduled",
        reason: "Regular checkup"
      },
      {
        id: "apt2",
        patientId: "patient2",
        patientName: "Jane Smith",
        patientEmail: "jane@example.com",
        date: "2026-02-11",
        time: "14:00",
        type: "follow-up",
        status: "scheduled",
        reason: "Follow-up consultation"
      }
    ];

    const total = mockAppointments.length;
    const paginatedAppointments = mockAppointments.slice(skip, skip + parseInt(limit as string, 10));

    res.status(200).json({
      success: true,
      count: paginatedAppointments.length,
      total,
      data: paginatedAppointments,
      pagination: {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        totalPages: Math.ceil(total / parseInt(limit as string, 10)),
      },
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

    // Mock patients data
    const mockPatients = [
      {
        id: "patient1",
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
        dateOfBirth: "1985-05-15",
        age: 41,
        gender: "male",
        address: "123 Main St, City, State",
        emergencyContact: {
          name: "Jane Doe",
          phone: "+1234567891",
          relationship: "spouse"
        },
        medicalHistory: ["Hypertension", "Diabetes Type 2"],
        allergies: ["Penicillin"],
        currentMedications: ["Metformin", "Lisinopril"],
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-02-01T10:00:00Z"
      },
      {
        id: "patient2",
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "+1234567892",
        dateOfBirth: "1990-08-22",
        age: 36,
        gender: "female",
        address: "456 Oak Ave, City, State",
        emergencyContact: {
          name: "Bob Smith",
          phone: "+1234567893",
          relationship: "husband"
        },
        medicalHistory: ["Migraine"],
        allergies: [],
        currentMedications: ["Sumatriptan"],
        createdAt: "2024-01-20T10:00:00Z",
        updatedAt: "2024-02-01T10:00:00Z"
      }
    ];

    let filteredPatients = mockPatients;
    if (search) {
      const searchLower = (search as string).toLowerCase();
      filteredPatients = mockPatients.filter(patient => 
        patient.name.toLowerCase().includes(searchLower) ||
        patient.email.toLowerCase().includes(searchLower) ||
        patient.phone.includes(searchLower)
      );
    }

    const total = filteredPatients.length;
    const skip = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);
    const paginatedPatients = filteredPatients.slice(skip, skip + parseInt(limit as string, 10));

    res.status(200).json({
      success: true,
      patients: paginatedPatients,
      total,
      pagination: {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        totalPages: Math.ceil(total / parseInt(limit as string, 10)),
      },
    });
  }
);