import { Request, Response } from "express";
import { Types } from "mongoose";
import asyncHandler from "../middleware/asyncHandler";
import Notification from "../models/Notification";
import { UserRole } from "@/types";
import { ResponseUtil } from "@/utils/response";

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Patient management
 */

export class PatientController {
  /**
   * @route   POST /api/patients
   * @desc    Create a new patient
   * @access  Private/Doctor/Admin
   */
  static create = asyncHandler(async (req: Request, res: Response) => {
    try {
      // TODO: Implement patient creation logic
      // This would typically involve creating a patient record in the database
      ResponseUtil.success(res, {}, 'Patient created successfully', 201);
    } catch (error: any) {
      ResponseUtil.error(res, error.message, 400);
    }
  });

  /**
   * @route   PUT /api/patients/:id
   * @desc    Update a patient
   * @access  Private/Doctor/Admin/Patient
   */
  static update = asyncHandler(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      // TODO: Implement patient update logic
      ResponseUtil.success(res, { id }, 'Patient updated successfully');
    } catch (error: any) {
      ResponseUtil.error(res, error.message, 400);
    }
  });

  /**
   * @route   GET /api/patients
   * @desc    Get list of patients with pagination
   * @access  Private/Doctor/Admin
   */
  static list = asyncHandler(async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      // TODO: Implement patient listing logic with pagination
      ResponseUtil.success(res, {
        patients: [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: 0,
          totalPages: 0
        }
      }, 'Patients retrieved successfully');
    } catch (error: any) {
      ResponseUtil.error(res, error.message, 400);
    }
  });
}

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

    const query: any = { user: req.user.userId };
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
        user: req.user.userId,
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
