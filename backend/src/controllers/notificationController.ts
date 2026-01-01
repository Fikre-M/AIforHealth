import { Request, Response } from 'express';
import { Types } from 'mongoose';
import NotificationService from '../services/NotificationService';
import asyncHandler from '../middleware/asyncHandler';

// Extend the Express Request type to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: Types.ObjectId;
        role: string;
        email: string;
        name: string;
      };
    }
  }
}

declare module 'express' {
  interface Request {
    user?: {
      _id: Types.ObjectId;
      role: string;
      email: string;
      name: string;
    };
  }
}

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }
  const { limit = '20', page = '1', unreadOnly } = req.query;
  
  const result = await NotificationService.getUserNotifications(
    req.user._id,
    {
      limit: parseInt(limit as string, 10),
      page: parseInt(page as string, 10),
      unreadOnly: unreadOnly === 'true'
    }
  );

  res.status(200).json({
    success: true,
    data: result.data,
    pagination: result.pagination
  });
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }
  const { id } = req.params;
  
  const notification = await NotificationService.markAsRead(id, req.user._id);
  
  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found or already marked as read'
    });
  }

  res.status(200).json({
    success: true,
    data: notification
  });
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }
  const result = await NotificationService.markAllAsRead(req.user._id);
  
  res.status(200).json({
    success: true,
    data: {
      markedRead: result.modifiedCount
    }
  });
});

export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }
  const { id } = req.params;
  
  const deleted = await NotificationService.deleteNotification(id, req.user._id);
  
  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found or already deleted'
    });
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});

// Admin/Internal endpoints
export const processPendingNotifications = asyncHandler(async (req: Request, res: Response) => {
  const result = await NotificationService.processPendingNotifications();
  
  res.status(200).json({
    success: true,
    data: result
  });
});

export const checkUpcomingAppointments = asyncHandler(async (req: Request, res: Response) => {
  const result = await NotificationService.checkForUpcomingAppointments();
  
  res.status(200).json({
    success: true,
    data: result
  });
});

export const checkMissedAppointments = asyncHandler(async (req: Request, res: Response) => {
  const result = await NotificationService.checkForMissedAppointments();
  
  res.status(200).json({
    success: true,
    data: result
  });
});
