// backend/src/controllers/patientController.ts
import { Request, Response } from "express";
import { Types } from "mongoose";
import asyncHandler from "../middleware/asyncHandler";
import Appointment, { AppointmentStatus } from "../models/Appointment";
import Notification from "../models/Notification";
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

// Example for patientController.ts
/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Patient management
 */

/**
 * @swagger
 * /patients/appointments/upcoming:
 *   get:
 *     summary: Get patient's upcoming appointments
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of upcoming appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Appointment'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Access denied. Patient role required.
 */
export const getUpcomingAppointments = asyncHandler(async (req: Request, res: Response) => {
  // ... existing implementation ...
});


/**
 * @route   GET /api/patients/appointments/upcoming
 * @desc    Get patient's upcoming appointments
 * @access  Private/Patient
 */
export const getUpcomingAppointments = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    if (req.user.role !== UserRole.PATIENT) {
      res
        .status(403)
        .json({
          success: false,
          message: "Access denied. Patient role required.",
        });
      return;
    }

    const { limit = "10", page = "1" } = req.query;
    const skip =
      (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);

    const [appointments, total] = await Promise.all([
      Appointment.find({
        patient: req.user._id,
        status: {
          $in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED],
        },
        appointmentDate: { $gte: new Date() },
      })
        .populate("doctor", "name specialty")
        .sort({ appointmentDate: 1 })
        .skip(skip)
        .limit(parseInt(limit as string, 10))
        .lean(),

      Appointment.countDocuments({
        patient: req.user._id,
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

/**
 * @route   GET /api/patients/appointments/history
 * @desc    Get patient's appointment history
 * @access  Private/Patient
 */
export const getAppointmentHistory = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    if (req.user.role !== UserRole.PATIENT) {
      res
        .status(403)
        .json({
          success: false,
          message: "Access denied. Patient role required.",
        });
      return;
    }

    const { limit = "10", page = "1", status } = req.query;
    const skip =
      (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);

    const query: any = { patient: req.user._id };
    if (status) {
      query.status = status;
    } else {
      query.status = {
        $in: [
          AppointmentStatus.COMPLETED,
          AppointmentStatus.CANCELLED,
          AppointmentStatus.NO_SHOW,
        ],
      };
    }

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate("doctor", "name specialty")
        .sort({ appointmentDate: -1 })
        .skip(skip)
        .limit(parseInt(limit as string, 10))
        .lean(),

      Appointment.countDocuments(query),
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

/**
 * @route   GET /api/patients/notifications
 * @desc    Get patient's notifications
 * @access  Private/Patient
 */
export const getPatientNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    if (req.user.role !== UserRole.PATIENT) {
      res
        .status(403)
        .json({
          success: false,
          message: "Access denied. Patient role required.",
        });
      return;
    }

    const { limit = "10", page = "1", read } = req.query;
    const skip =
      (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);

    const query: any = { user: req.user._id };
    if (read !== undefined) {
      query.read = read === "true";
    }

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit as string, 10))
        .lean(),

      Notification.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: notifications.length,
      total,
      data: notifications,
      pagination: {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        totalPages: Math.ceil(total / parseInt(limit as string, 10)),
      },
    });
  }
);

/**
 * @route   PATCH /api/patients/notifications/:notificationId/read
 * @desc    Mark notification as read
 * @access  Private/Patient
 */
export const markNotificationAsRead = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    if (req.user.role !== UserRole.PATIENT) {
      res
        .status(403)
        .json({
          success: false,
          message: "Access denied. Patient role required.",
        });
      return;
    }

    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        user: req.user._id,
      },
      { read: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({
        success: false,
        message:
          "Notification not found or you are not authorized to update it",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  }
);
