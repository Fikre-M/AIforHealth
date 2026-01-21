import { Request, Response } from 'express';
import { Types } from 'mongoose';
import asyncHandler from '../middleware/asyncHandler';
import Medication from '../models/Medication';
import HealthReminder from '../models/HealthReminder';
import HealthMetric from '../models/HealthMetric';
import { UserRole } from '@/types';
import { ResponseUtil } from '@/utils/response';
import { AppError } from '@/utils/errors';

// MEDICATION CONTROLLERS

/**
 * @swagger
 * /api/v1/health/medications:
 *   get:
 *     summary: Get user's medications
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of medications
 */
export const getMedications = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { active, page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  let query: any = {};

  // Patients can only see their own medications
  if (req.user.role === UserRole.PATIENT) {
    query.patient = req.user.userId;
  } else if (req.user.role === UserRole.DOCTOR) {
    // Doctors can see medications they prescribed or for their patients
    query.prescribedBy = req.user.userId;
  }
  // Admins can see all medications (no additional filter)

  if (active !== undefined) {
    query.isActive = active === 'true';
  }

  const [medications, total] = await Promise.all([
    Medication.find(query)
      .populate('patient', 'name email')
      .populate('prescribedBy', 'name specialty')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Medication.countDocuments(query)
  ]);

  ResponseUtil.success(res, {
    medications,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit))
    }
  });
});

/**
 * @swagger
 * /api/v1/health/medications:
 *   post:
 *     summary: Create a new medication (doctors and admins only)
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patient
 *               - name
 *               - dosage
 *               - frequency
 *             properties:
 *               patient:
 *                 type: string
 *               name:
 *                 type: string
 *               dosage:
 *                 type: string
 *               frequency:
 *                 type: string
 *               instructions:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               totalDoses:
 *                 type: number
 *               sideEffects:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Medication created successfully
 */
export const createMedication = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const medicationData = {
    ...req.body,
    prescribedBy: req.user.userId,
    remainingDoses: req.body.totalDoses
  };

  const medication = await Medication.create(medicationData);
  
  const populatedMedication = await Medication.findById(medication._id)
    .populate('patient', 'name email')
    .populate('prescribedBy', 'name specialty');

  ResponseUtil.success(res, populatedMedication, 'Medication created successfully', 201);
});

/**
 * @swagger
 * /api/v1/health/medications/{id}:
 *   get:
 *     summary: Get medication by ID
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Medication details
 */
export const getMedicationById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { id } = req.params;
  
  const medication = await Medication.findById(id)
    .populate('patient', 'name email')
    .populate('prescribedBy', 'name specialty');

  if (!medication) {
    throw new AppError('Medication not found', 404);
  }

  // Check authorization
  const isPatient = req.user.role === UserRole.PATIENT && medication.patient._id.toString() === req.user.userId;
  const isDoctor = req.user.role === UserRole.DOCTOR && medication.prescribedBy._id.toString() === req.user.userId;
  const isAdmin = req.user.role === UserRole.ADMIN;

  if (!isPatient && !isDoctor && !isAdmin) {
    throw new AppError('Access denied', 403);
  }

  ResponseUtil.success(res, medication);
});

/**
 * @swagger
 * /api/v1/health/medications/{id}:
 *   put:
 *     summary: Update medication (doctors and admins only)
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Medication updated successfully
 */
export const updateMedication = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { id } = req.params;
  const updates = req.body;

  const medication = await Medication.findById(id);
  if (!medication) {
    throw new AppError('Medication not found', 404);
  }

  // Check authorization - only prescribing doctor or admin can update
  const isDoctor = req.user.role === UserRole.DOCTOR && medication.prescribedBy.toString() === req.user.userId;
  const isAdmin = req.user.role === UserRole.ADMIN;

  if (!isDoctor && !isAdmin) {
    throw new AppError('Access denied', 403);
  }

  Object.assign(medication, updates);
  await medication.save();

  const updatedMedication = await Medication.findById(id)
    .populate('patient', 'name email')
    .populate('prescribedBy', 'name specialty');

  ResponseUtil.success(res, updatedMedication, 'Medication updated successfully');
});

/**
 * @swagger
 * /api/v1/health/medications/{id}:
 *   delete:
 *     summary: Delete medication (doctors and admins only)
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Medication deleted successfully
 */
export const deleteMedication = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { id } = req.params;

  const medication = await Medication.findById(id);
  if (!medication) {
    throw new AppError('Medication not found', 404);
  }

  // Check authorization - only prescribing doctor or admin can delete
  const isDoctor = req.user.role === UserRole.DOCTOR && medication.prescribedBy.toString() === req.user.userId;
  const isAdmin = req.user.role === UserRole.ADMIN;

  if (!isDoctor && !isAdmin) {
    throw new AppError('Access denied', 403);
  }

  await Medication.findByIdAndDelete(id);

  ResponseUtil.success(res, null, 'Medication deleted successfully');
});

// HEALTH REMINDER CONTROLLERS

/**
 * @swagger
 * /api/v1/health/reminders:
 *   get:
 *     summary: Get user's health reminders
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [medication, checkup, exercise, diet, appointment, custom]
 *     responses:
 *       200:
 *         description: List of health reminders
 */
export const getHealthReminders = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { completed, priority, type, page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  let query: any = { user: req.user.userId };

  if (completed !== undefined) {
    query.completed = completed === 'true';
  }
  if (priority) {
    query.priority = priority;
  }
  if (type) {
    query.type = type;
  }

  const [reminders, total] = await Promise.all([
    HealthReminder.find(query)
      .sort({ dueDate: 1, priority: -1 })
      .skip(skip)
      .limit(Number(limit)),
    HealthReminder.countDocuments(query)
  ]);

  ResponseUtil.success(res, {
    reminders,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit))
    }
  });
});

/**
 * @swagger
 * /api/v1/health/reminders:
 *   post:
 *     summary: Create a new health reminder
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Health reminder created successfully
 */
export const createHealthReminder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const reminderData = {
    ...req.body,
    user: req.user.userId
  };

  const reminder = await HealthReminder.create(reminderData);

  ResponseUtil.success(res, reminder, 'Health reminder created successfully', 201);
});

/**
 * @swagger
 * /api/v1/health/reminders/{id}:
 *   get:
 *     summary: Get health reminder by ID
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Health reminder details
 */
export const getHealthReminderById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { id } = req.params;
  
  const reminder = await HealthReminder.findById(id);

  if (!reminder) {
    throw new AppError('Health reminder not found', 404);
  }

  // Check authorization - users can only see their own reminders
  if (reminder.user.toString() !== req.user.userId && req.user.role !== UserRole.ADMIN) {
    throw new AppError('Access denied', 403);
  }

  ResponseUtil.success(res, reminder);
});

/**
 * @swagger
 * /api/v1/health/reminders/{id}:
 *   put:
 *     summary: Update health reminder
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Health reminder updated successfully
 */
export const updateHealthReminder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { id } = req.params;
  const updates = req.body;

  const reminder = await HealthReminder.findById(id);
  if (!reminder) {
    throw new AppError('Health reminder not found', 404);
  }

  // Check authorization - users can only update their own reminders
  if (reminder.user.toString() !== req.user.userId && req.user.role !== UserRole.ADMIN) {
    throw new AppError('Access denied', 403);
  }

  Object.assign(reminder, updates);
  await reminder.save();

  ResponseUtil.success(res, reminder, 'Health reminder updated successfully');
});

/**
 * @swagger
 * /api/v1/health/reminders/{id}/complete:
 *   patch:
 *     summary: Mark health reminder as complete
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Health reminder marked as complete
 */
export const markReminderComplete = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { id } = req.params;

  const reminder = await HealthReminder.findById(id);
  if (!reminder) {
    throw new AppError('Health reminder not found', 404);
  }

  // Check authorization - users can only complete their own reminders
  if (reminder.user.toString() !== req.user.userId && req.user.role !== UserRole.ADMIN) {
    throw new AppError('Access denied', 403);
  }

  reminder.completed = true;
  reminder.completedAt = new Date();
  await reminder.save();

  ResponseUtil.success(res, reminder, 'Health reminder marked as complete');
});

/**
 * @swagger
 * /api/v1/health/reminders/{id}:
 *   delete:
 *     summary: Delete health reminder
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Health reminder deleted successfully
 */
export const deleteHealthReminder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { id } = req.params;

  const reminder = await HealthReminder.findById(id);
  if (!reminder) {
    throw new AppError('Health reminder not found', 404);
  }

  // Check authorization - users can only delete their own reminders
  if (reminder.user.toString() !== req.user.userId && req.user.role !== UserRole.ADMIN) {
    throw new AppError('Access denied', 403);
  }

  await HealthReminder.findByIdAndDelete(id);

  ResponseUtil.success(res, null, 'Health reminder deleted successfully');
});

// HEALTH METRIC CONTROLLERS

/**
 * @swagger
 * /api/v1/health/metrics:
 *   get:
 *     summary: Get user's health metrics
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List of health metrics
 */
export const getHealthMetrics = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { type, startDate, endDate, page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  let query: any = { user: req.user.userId };

  if (type) {
    query.type = type;
  }
  if (startDate || endDate) {
    query.recordedDate = {};
    if (startDate) query.recordedDate.$gte = new Date(startDate as string);
    if (endDate) query.recordedDate.$lte = new Date(endDate as string);
  }

  const [metrics, total] = await Promise.all([
    HealthMetric.find(query)
      .populate('recordedBy', 'name role')
      .sort({ recordedDate: -1 })
      .skip(skip)
      .limit(Number(limit)),
    HealthMetric.countDocuments(query)
  ]);

  ResponseUtil.success(res, {
    metrics,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit))
    }
  });
});

/**
 * @swagger
 * /api/v1/health/metrics:
 *   post:
 *     summary: Create a new health metric
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Health metric created successfully
 */
export const createHealthMetric = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const metricData = {
    ...req.body,
    user: req.user.userId,
    recordedBy: req.user.userId
  };

  const metric = await HealthMetric.create(metricData);

  const populatedMetric = await HealthMetric.findById(metric._id)
    .populate('recordedBy', 'name role');

  ResponseUtil.success(res, populatedMetric, 'Health metric created successfully', 201);
});

/**
 * @swagger
 * /api/v1/health/metrics/{id}:
 *   get:
 *     summary: Get health metric by ID
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Health metric details
 */
export const getHealthMetricById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { id } = req.params;
  
  const metric = await HealthMetric.findById(id)
    .populate('recordedBy', 'name role');

  if (!metric) {
    throw new AppError('Health metric not found', 404);
  }

  // Check authorization - users can only see their own metrics
  if (metric.user.toString() !== req.user.userId && req.user.role !== UserRole.ADMIN) {
    throw new AppError('Access denied', 403);
  }

  ResponseUtil.success(res, metric);
});

/**
 * @swagger
 * /api/v1/health/metrics/{id}:
 *   put:
 *     summary: Update health metric
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Health metric updated successfully
 */
export const updateHealthMetric = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { id } = req.params;
  const updates = req.body;

  const metric = await HealthMetric.findById(id);
  if (!metric) {
    throw new AppError('Health metric not found', 404);
  }

  // Check authorization - users can only update their own metrics or if they recorded it
  const isOwner = metric.user.toString() === req.user.userId;
  const isRecorder = metric.recordedBy?.toString() === req.user.userId;
  const isAdmin = req.user.role === UserRole.ADMIN;

  if (!isOwner && !isRecorder && !isAdmin) {
    throw new AppError('Access denied', 403);
  }

  Object.assign(metric, updates);
  await metric.save();

  const updatedMetric = await HealthMetric.findById(id)
    .populate('recordedBy', 'name role');

  ResponseUtil.success(res, updatedMetric, 'Health metric updated successfully');
});

/**
 * @swagger
 * /api/v1/health/metrics/{id}:
 *   delete:
 *     summary: Delete health metric
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Health metric deleted successfully
 */
export const deleteHealthMetric = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { id } = req.params;

  const metric = await HealthMetric.findById(id);
  if (!metric) {
    throw new AppError('Health metric not found', 404);
  }

  // Check authorization - users can only delete their own metrics or if they recorded it
  const isOwner = metric.user.toString() === req.user.userId;
  const isRecorder = metric.recordedBy?.toString() === req.user.userId;
  const isAdmin = req.user.role === UserRole.ADMIN;

  if (!isOwner && !isRecorder && !isAdmin) {
    throw new AppError('Access denied', 403);
  }

  await HealthMetric.findByIdAndDelete(id);

  ResponseUtil.success(res, null, 'Health metric deleted successfully');
});