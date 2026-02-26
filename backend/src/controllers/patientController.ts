import { Request, Response } from "express";
import { Types } from "mongoose";
import asyncHandler from "../middleware/asyncHandler";
import Notification from "../models/Notification";
import { UserRole } from "@/types";

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Patient management
 */

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
