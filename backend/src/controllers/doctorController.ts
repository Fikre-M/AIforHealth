// backend/src/controllers/doctorController.ts
import { Request, Response } from "express";
import { Types } from "mongoose";
import asyncHandler from "../middleware/asyncHandler";
import Appointment, { AppointmentStatus } from "../models/Appointment";
import User from "../models/User";
import { UserRole } from "@/types";

// Extend the Express Request type
declare module "express" {
  interface Request {
    user?: {
      _id: Types.ObjectId;
      role: string;
      email: string;
      name: string;
    };
  }
}

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
      res
        .status(403)
        .json({
          success: false,
          message: "Access denied. Doctor role required.",
        });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await Appointment.find({
      doctor: req.user._id,
      appointmentDate: {
        $gte: today,
        $lt: tomorrow,
      },
    })
      .populate("patient", "name email phone")
      .sort({ appointmentDate: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
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
      res
        .status(403)
        .json({
          success: false,
          message: "Access denied. Doctor role required.",
        });
      return;
    }

    const patients = await Appointment.aggregate([
      {
        $match: {
          doctor: new Types.ObjectId(req.user._id),
          status: {
            $in: [AppointmentStatus.COMPLETED, AppointmentStatus.CONFIRMED],
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "patient",
          foreignField: "_id",
          as: "patientInfo",
        },
      },
      { $unwind: "$patientInfo" },
      {
        $group: {
          _id: "$patient",
          name: { $first: "$patientInfo.name" },
          email: { $first: "$patientInfo.email" },
          phone: { $first: "$patientInfo.phone" },
          lastAppointment: { $max: "$appointmentDate" },
          totalAppointments: { $sum: 1 },
        },
      },
      { $sort: { name: 1 } },
    ]);

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients,
    });
  }
);

/**
 * @route   PATCH /api/doctors/appointments/:appointmentId/status
 * @desc    Update appointment status
 * @access  Private/Doctor
 */
export const updateAppointmentStatus = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    if (req.user.role !== UserRole.DOCTOR) {
      res
        .status(403)
        .json({
          success: false,
          message: "Access denied. Doctor role required.",
        });
      return;
    }

    const { appointmentId } = req.params;
    const { status, notes } = req.body;

    if (!Object.values(AppointmentStatus).includes(status)) {
      res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${Object.values(
          AppointmentStatus
        ).join(", ")}`,
      });
      return;
    }

    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: appointmentId,
        doctor: req.user._id,
      },
      {
        status,
        $set: {
          doctorNotes: notes || "",
          updatedAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    )
      .populate("patient", "name email phone")
      .populate("doctor", "name specialty");

    if (!appointment) {
      res.status(404).json({
        success: false,
        message: "Appointment not found or you are not authorized to update it",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: appointment,
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
      res
        .status(403)
        .json({
          success: false,
          message: "Access denied. Doctor role required.",
        });
      return;
    }

    const { limit = "10", page = "1" } = req.query;
    const skip =
      (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);

    const [appointments, total] = await Promise.all([
      Appointment.find({
        doctor: req.user._id,
        status: {
          $in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED],
        },
        appointmentDate: { $gte: new Date() },
      })
        .populate("patient", "name email phone")
        .sort({ appointmentDate: 1 })
        .skip(skip)
        .limit(parseInt(limit as string, 10))
        .lean(),

      Appointment.countDocuments({
        doctor: req.user._id,
        status: {
          $in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED],
        },
        appointmentDate: { $gte: new Date() },
      }),
    ]);

    res.status(200).json({
      success: true,
      count: appointments.length,
      total,
      data: appointments,
      pagination: {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        totalPages: Math.ceil(total / parseInt(limit as string, 10)),
      },
    });
  }
);
