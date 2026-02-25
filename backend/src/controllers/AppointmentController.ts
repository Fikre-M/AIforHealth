import { Request, Response } from 'express';
import { ResponseUtil } from '@/utils/apiResponse';
import { AppError, ValidationError, NotFoundError } from '@/middleware/errorHandler';
import { AppointmentService } from '@/services/AppointmentService';
import { validationResult } from 'express-validator';

export class AppointmentController {
  /**
   * Create new appointment
   */
  static async create(req: Request, res: Response) {
    try {
      // Check validation results
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.validationError(res, errors.array());
      }

      const appointment = await AppointmentService.createAppointment(req.body);

      // Return created response with location header
      return ResponseUtil.created(
        res,
        appointment,
        'Appointment created successfully',
        `/api/v1/appointments/${appointment.id}`
      );
    } catch (error: any) {
      // Handle specific errors
      if (error.code === 11000) {
        return ResponseUtil.conflict(res, 'Appointment slot already booked');
      }

      if (error.name === 'ValidationError') {
        return ResponseUtil.badRequest(res, error.message);
      }

      // Re-throw for error handler
      throw error;
    }
  }

  /**
   * Get appointment by ID
   */
  static async getById(req: Request, res: Response) {
    const { id } = req.params;

    const appointment = await AppointmentService.getAppointmentById(id);

    if (!appointment) {
      throw new NotFoundError('Appointment');
    }

    return ResponseUtil.success(res, appointment, 'Appointment retrieved successfully');
  }

  /**
   * Get appointments with pagination
   */
  static async getAppointments(req: Request, res: Response) {
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;

    const result = await AppointmentService.getAppointments({
      page: Number(page),
      limit: Number(limit),
      status: status as string,
      startDate: startDate as string,
      endDate: endDate as string,
    });

    return ResponseUtil.paginated(
      res,
      result.appointments,
      {
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
      },
      'Appointments retrieved successfully'
    );
  }

  /**
   * Update appointment
   */
  static async update(req: Request, res: Response) {
    const { id } = req.params;

    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseUtil.validationError(res, errors.array());
    }

    const appointment = await AppointmentService.updateAppointment(id, req.body);

    if (!appointment) {
      throw new NotFoundError('Appointment');
    }

    return ResponseUtil.success(res, appointment, 'Appointment updated successfully');
  }

  /**
   * Cancel appointment
   */
  static async cancel(req: Request, res: Response) {
    const { id } = req.params;
    const { reason } = req.body;

    const appointment = await AppointmentService.cancelAppointment(id, reason);

    if (!appointment) {
      throw new NotFoundError('Appointment');
    }

    return ResponseUtil.success(res, appointment, 'Appointment cancelled successfully');
  }

  /**
   * Reschedule appointment
   */
  static async reschedule(req: Request, res: Response) {
    const { id } = req.params;
    const { newDate, reason } = req.body;

    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseUtil.validationError(res, errors.array());
    }

    const appointment = await AppointmentService.rescheduleAppointment(id, newDate, reason);

    if (!appointment) {
      throw new NotFoundError('Appointment');
    }

    return ResponseUtil.success(res, appointment, 'Appointment rescheduled successfully');
  }

  /**
   * Complete appointment
   */
  static async complete(req: Request, res: Response) {
    const { id } = req.params;
    const { notes, diagnosis, prescription } = req.body;

    const appointment = await AppointmentService.completeAppointment(id, {
      notes,
      diagnosis,
      prescription,
    });

    if (!appointment) {
      throw new NotFoundError('Appointment');
    }

    return ResponseUtil.success(res, appointment, 'Appointment completed successfully');
  }

  /**
   * Get doctor's appointments
   */
  static async getDoctorAppointments(req: Request, res: Response) {
    const { doctorId } = req.params;
    const { page = 1, limit = 10, date } = req.query;

    const result = await AppointmentService.getDoctorAppointments(doctorId, {
      page: Number(page),
      limit: Number(limit),
      date: date as string,
    });

    return ResponseUtil.paginated(
      res,
      result.appointments,
      {
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
      },
      'Doctor appointments retrieved successfully'
    );
  }

  /**
   * Get patient's appointments
   */
  static async getPatientAppointments(req: Request, res: Response) {
    const { patientId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const result = await AppointmentService.getPatientAppointments(patientId, {
      page: Number(page),
      limit: Number(limit),
      status: status as string,
    });

    return ResponseUtil.paginated(
      res,
      result.appointments,
      {
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
      },
      'Patient appointments retrieved successfully'
    );
  }

  /**
   * Get appointment statistics
   */
  static async getStatistics(req: Request, res: Response) {
    const { startDate, endDate, doctorId } = req.query;

    const statistics = await AppointmentService.getAppointmentStatistics({
      startDate: startDate as string,
      endDate: endDate as string,
      doctorId: doctorId as string,
    });

    return ResponseUtil.success(res, statistics, 'Statistics retrieved successfully');
  }

  /**
   * Bulk update appointments
   */
  static async bulkUpdate(req: Request, res: Response) {
    const { operation, appointments } = req.body;

    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseUtil.validationError(res, errors.array());
    }

    const result = await AppointmentService.bulkUpdateAppointments(operation, appointments);

    return ResponseUtil.success(res, result, `Bulk ${operation} completed successfully`);
  }

  /**
   * Export appointments
   */
  static async export(req: Request, res: Response) {
    const { format, startDate, endDate } = req.query;

    const exportData = await AppointmentService.exportAppointments({
      format: format as string,
      startDate: startDate as string,
      endDate: endDate as string,
    });

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=appointments.csv');
      return res.send(exportData);
    }

    return ResponseUtil.success(res, exportData, 'Export completed successfully');
  }
}

// import { Request, Response } from 'express';
// import { Types } from 'mongoose';
// import asyncHandler from '../middleware/asyncHandler';
// import { Appointment, User, IAppointment, IUser } from '../models';
// import { AppointmentStatus, AppointmentType } from '../models/Appointment';
// import { UserRole } from '@/types';
// import { ResponseUtil } from '@/utils/response';
// import { AppError } from '@/utils/errors';
// import { EmailService } from '@/services/EmailService';
// import { SMSService } from '@/services/SMSService';

// /**
//  * @swagger
//  * components:
//  *   schemas:
//  *     Appointment:
//  *       type: object
//  *       required:
//  *         - patient
//  *         - doctor
//  *         - appointmentDate
//  *         - duration
//  *         - type
//  *         - reason
//  *       properties:
//  *         _id:
//  *           type: string
//  *           description: Appointment ID
//  *         patient:
//  *           type: string
//  *           description: Patient user ID
//  *         doctor:
//  *           type: string
//  *           description: Doctor user ID
//  *         appointmentDate:
//  *           type: string
//  *           format: date-time
//  *           description: Appointment date and time
//  *         duration:
//  *           type: number
//  *           description: Duration in minutes
//  *         status:
//  *           type: string
//  *           enum: [scheduled, confirmed, in_progress, completed, missed, cancelled, rescheduled]
//  *         type:
//  *           type: string
//  *           enum: [consultation, follow_up, emergency, routine_checkup, specialist, telemedicine]
//  *         reason:
//  *           type: string
//  *           description: Reason for appointment
//  *         notes:
//  *           type: string
//  *           description: Patient notes
//  *         doctorNotes:
//  *           type: string
//  *           description: Doctor's notes
//  *         prescription:
//  *           type: string
//  *           description: Prescription details
//  *         diagnosis:
//  *           type: string
//  *           description: Diagnosis
//  *         symptoms:
//  *           type: array
//  *           items:
//  *             type: string
//  *           description: List of symptoms
//  *         vitals:
//  *           type: object
//  *           properties:
//  *             bloodPressure:
//  *               type: string
//  *             heartRate:
//  *               type: number
//  *             temperature:
//  *               type: number
//  *             weight:
//  *               type: number
//  *             height:
//  *               type: number
//  *         followUpRequired:
//  *           type: boolean
//  *         followUpDate:
//  *           type: string
//  *           format: date-time
//  *         isEmergency:
//  *           type: boolean
//  *         paymentStatus:
//  *           type: string
//  *           enum: [pending, paid, refunded]
//  *         amount:
//  *           type: number
//  *         createdAt:
//  *           type: string
//  *           format: date-time
//  *         updatedAt:
//  *           type: string
//  *           format: date-time
//  */

// /**
//  * @swagger
//  * /api/v1/appointments:
//  *   post:
//  *     summary: Create a new appointment
//  *     tags: [Appointments]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - doctor
//  *               - appointmentDate
//  *               - duration
//  *               - type
//  *               - reason
//  *             properties:
//  *               doctor:
//  *                 type: string
//  *                 description: Doctor user ID
//  *               appointmentDate:
//  *                 type: string
//  *                 format: date-time
//  *               duration:
//  *                 type: number
//  *                 minimum: 15
//  *                 maximum: 240
//  *               type:
//  *                 type: string
//  *                 enum: [consultation, follow_up, emergency, routine_checkup, specialist, telemedicine]
//  *               reason:
//  *                 type: string
//  *                 minLength: 10
//  *                 maxLength: 500
//  *               notes:
//  *                 type: string
//  *                 maxLength: 1000
//  *               symptoms:
//  *                 type: array
//  *                 items:
//  *                   type: string
//  *               isEmergency:
//  *                 type: boolean
//  *     responses:
//  *       201:
//  *         description: Appointment created successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                 data:
//  *                   $ref: '#/components/schemas/Appointment'
//  *       400:
//  *         description: Invalid input data
//  *       409:
//  *         description: Appointment conflict (doctor not available)
//  */
// export const createAppointment = asyncHandler(async (req: Request, res: Response) => {
//   const { doctor, appointmentDate, duration, type, reason, notes, symptoms, isEmergency } = req.body;

//   if (!req.user) {
//     throw new AppError('Authentication required', 401);
//   }

//   // Validate doctor exists and is actually a doctor
//   const doctorUser = await User.findById(doctor);
//   if (!doctorUser || doctorUser.role !== UserRole.DOCTOR) {
//     throw new AppError('Invalid doctor ID', 400);
//   }

//   // Check for appointment conflicts
//   const conflictingAppointment = await Appointment.findOne({
//     doctor,
//     appointmentDate: {
//       $gte: new Date(appointmentDate),
//       $lt: new Date(new Date(appointmentDate).getTime() + duration * 60000)
//     },
//     status: { $in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS] }
//   });

//   if (conflictingAppointment) {
//     throw new AppError('Doctor is not available at the requested time', 409);
//   }

//   // Create appointment
//   const appointment = await Appointment.create({
//     patient: req.user.userId,
//     doctor,
//     appointmentDate: new Date(appointmentDate),
//     duration,
//     type,
//     reason,
//     notes,
//     symptoms,
//     isEmergency: isEmergency || false,
//     status: isEmergency ? AppointmentStatus.CONFIRMED : AppointmentStatus.SCHEDULED
//   });

//   const populatedAppointment = await Appointment.findById(appointment._id)
//     .populate('patient', 'name email phone')
//     .populate('doctor', 'name email specialty');

//   // Send confirmations (async, don't block response)
//   if (populatedAppointment) {
//     Promise.all([
//       EmailService.sendAppointmentConfirmation(
//         populatedAppointment,
//         populatedAppointment.patient as unknown as IUser,
//         populatedAppointment.doctor as unknown as IUser
//       ),
//       SMSService.sendAppointmentConfirmation(
//         populatedAppointment,
//         populatedAppointment.patient as unknown as IUser,
//         populatedAppointment.doctor as unknown as IUser
//       ),
//     ]).catch(err => {
//       console.error('Failed to send confirmations:', err);
//       // Don't fail the request if notifications fail
//     });
//   }

//   ResponseUtil.success(res, {
//     appointment: populatedAppointment,
//     confirmationNumber: appointment.confirmationNumber,
//     message: 'Appointment created successfully. Confirmation sent to your email and phone.',
//   }, 'Appointment created successfully', 201);
// });

// /**
//  * @swagger
//  * /api/v1/appointments:
//  *   get:
//  *     summary: Get appointments with filtering and pagination
//  *     tags: [Appointments]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: page
//  *         schema:
//  *           type: integer
//  *           default: 1
//  *       - in: query
//  *         name: limit
//  *         schema:
//  *           type: integer
//  *           default: 10
//  *       - in: query
//  *         name: status
//  *         schema:
//  *           type: string
//  *           enum: [scheduled, confirmed, in_progress, completed, missed, cancelled, rescheduled]
//  *       - in: query
//  *         name: type
//  *         schema:
//  *           type: string
//  *           enum: [consultation, follow_up, emergency, routine_checkup, specialist, telemedicine]
//  *       - in: query
//  *         name: startDate
//  *         schema:
//  *           type: string
//  *           format: date
//  *       - in: query
//  *         name: endDate
//  *         schema:
//  *           type: string
//  *           format: date
//  *     responses:
//  *       200:
//  *         description: List of appointments
//  */
// export const getAppointments = asyncHandler(async (req: Request, res: Response) => {
//   if (!req.user) {
//     throw new AppError('Authentication required', 401);
//   }

//   const { page = 1, limit = 10, status, type, startDate, endDate } = req.query;
//   const skip = (Number(page) - 1) * Number(limit);

//   // Build query based on user role
//   let query: any = {};

//   if (req.user.role === UserRole.PATIENT) {
//     query.patient = req.user.userId;
//   } else if (req.user.role === UserRole.DOCTOR) {
//     query.doctor = req.user.userId;
//   }
//   // Admins can see all appointments (no additional filter)

//   // Apply filters
//   if (status) query.status = status;
//   if (type) query.type = type;
//   if (startDate || endDate) {
//     query.appointmentDate = {};
//     if (startDate) query.appointmentDate.$gte = new Date(startDate as string);
//     if (endDate) query.appointmentDate.$lte = new Date(endDate as string);
//   }

//   const [appointments, total] = await Promise.all([
//     Appointment.find(query)
//       .populate('patient', 'name email')
//       .populate('doctor', 'name email specialty')
//       .sort({ appointmentDate: -1 })
//       .skip(skip)
//       .limit(Number(limit)),
//     Appointment.countDocuments(query)
//   ]);

//   ResponseUtil.success(res, {
//     appointments,
//     pagination: {
//       page: Number(page),
//       limit: Number(limit),
//       total,
//       totalPages: Math.ceil(total / Number(limit))
//     }
//   });
// });

// /**
//  * @swagger
//  * /api/v1/appointments/{id}:
//  *   get:
//  *     summary: Get appointment by ID
//  *     tags: [Appointments]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Appointment details
//  *       404:
//  *         description: Appointment not found
//  */
// export const getAppointmentById = asyncHandler(async (req: Request, res: Response) => {
//   if (!req.user) {
//     throw new AppError('Authentication required', 401);
//   }

//   const { id } = req.params;

//   const appointment = await Appointment.findById(id)
//     .populate('patient', 'name email phone')
//     .populate('doctor', 'name email specialty');

//   if (!appointment) {
//     throw new AppError('Appointment not found', 404);
//   }

//   // Check authorization
//   const isPatient = req.user.role === UserRole.PATIENT && appointment.patient._id.toString() === req.user.userId;
//   const isDoctor = req.user.role === UserRole.DOCTOR && appointment.doctor._id.toString() === req.user.userId;
//   const isAdmin = req.user.role === UserRole.ADMIN;

//   if (!isPatient && !isDoctor && !isAdmin) {
//     throw new AppError('Access denied', 403);
//   }

//   ResponseUtil.success(res, appointment);
// });

// /**
//  * @swagger
//  * /api/v1/appointments/{id}:
//  *   put:
//  *     summary: Update appointment
//  *     tags: [Appointments]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               appointmentDate:
//  *                 type: string
//  *                 format: date-time
//  *               duration:
//  *                 type: number
//  *               reason:
//  *                 type: string
//  *               notes:
//  *                 type: string
//  *               doctorNotes:
//  *                 type: string
//  *               symptoms:
//  *                 type: array
//  *                 items:
//  *                   type: string
//  *     responses:
//  *       200:
//  *         description: Appointment updated successfully
//  */
// export const updateAppointment = asyncHandler(async (req: Request, res: Response) => {
//   if (!req.user) {
//     throw new AppError('Authentication required', 401);
//   }

//   const { id } = req.params;
//   const updates = req.body;

//   const appointment = await Appointment.findById(id);
//   if (!appointment) {
//     throw new AppError('Appointment not found', 404);
//   }

//   // Check authorization
//   const isPatient = req.user.role === UserRole.PATIENT && appointment.patient.toString() === req.user.userId;
//   const isDoctor = req.user.role === UserRole.DOCTOR && appointment.doctor.toString() === req.user.userId;
//   const isAdmin = req.user.role === UserRole.ADMIN;

//   if (!isPatient && !isDoctor && !isAdmin) {
//     throw new AppError('Access denied', 403);
//   }

//   // Patients can only update certain fields
//   if (req.user.role === UserRole.PATIENT) {
//     const allowedFields = ['reason', 'notes', 'symptoms'];
//     const patientUpdates = Object.keys(updates).reduce((acc, key) => {
//       if (allowedFields.includes(key)) {
//         acc[key] = updates[key];
//       }
//       return acc;
//     }, {} as any);
//     Object.assign(appointment, patientUpdates);
//   } else {
//     // Doctors and admins can update more fields
//     Object.assign(appointment, updates);
//   }

//   await appointment.save();

//   const updatedAppointment = await Appointment.findById(id)
//     .populate('patient', 'name email')
//     .populate('doctor', 'name email specialty');

//   ResponseUtil.success(res, updatedAppointment, 'Appointment updated successfully');
// });

// /**
//  * @swagger
//  * /api/v1/appointments/{id}/status:
//  *   patch:
//  *     summary: Update appointment status
//  *     tags: [Appointments]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - status
//  *             properties:
//  *               status:
//  *                 type: string
//  *                 enum: [scheduled, confirmed, in_progress, completed, missed, cancelled]
//  *     responses:
//  *       200:
//  *         description: Status updated successfully
//  */
// export const updateAppointmentStatus = asyncHandler(async (req: Request, res: Response) => {
//   if (!req.user) {
//     throw new AppError('Authentication required', 401);
//   }

//   const { id } = req.params;
//   const { status } = req.body;

//   const appointment = await Appointment.findById(id);
//   if (!appointment) {
//     throw new AppError('Appointment not found', 404);
//   }

//   // Only doctors and admins can update status
//   if (req.user.role !== UserRole.DOCTOR && req.user.role !== UserRole.ADMIN) {
//     throw new AppError('Access denied. Only doctors and admins can update appointment status', 403);
//   }

//   // If doctor, ensure they own the appointment
//   if (req.user.role === UserRole.DOCTOR && appointment.doctor.toString() !== req.user.userId) {
//     throw new AppError('Access denied', 403);
//   }

//   appointment.status = status;
//   await appointment.save();

//   const updatedAppointment = await Appointment.findById(id)
//     .populate('patient', 'name email')
//     .populate('doctor', 'name email specialty');

//   ResponseUtil.success(res, updatedAppointment, 'Appointment status updated successfully');
// });

// /**
//  * @swagger
//  * /api/v1/appointments/{id}/cancel:
//  *   post:
//  *     summary: Cancel appointment
//  *     tags: [Appointments]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     requestBody:
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               reason:
//  *                 type: string
//  *                 description: Reason for cancellation
//  *     responses:
//  *       200:
//  *         description: Appointment cancelled successfully
//  */
// export const cancelAppointment = asyncHandler(async (req: Request, res: Response) => {
//   if (!req.user) {
//     throw new AppError('Authentication required', 401);
//   }

//   const { id } = req.params;
//   const { reason } = req.body;

//   const appointment = await Appointment.findById(id);
//   if (!appointment) {
//     throw new AppError('Appointment not found', 404);
//   }

//   // Check if user can cancel this appointment
//   const isPatient = req.user.role === UserRole.PATIENT && appointment.patient.toString() === req.user.userId;
//   const isDoctor = req.user.role === UserRole.DOCTOR && appointment.doctor.toString() === req.user.userId;
//   const isAdmin = req.user.role === UserRole.ADMIN;

//   if (!isPatient && !isDoctor && !isAdmin) {
//     throw new AppError('Access denied', 403);
//   }

//   // Check if appointment can be cancelled
//   if (!appointment.canBeCancelled()) {
//     throw new AppError('This appointment cannot be cancelled', 400);
//   }

//   appointment.status = AppointmentStatus.CANCELLED;
//   appointment.cancelledBy = new Types.ObjectId(req.user.userId);
//   appointment.cancellationReason = reason;
//   await appointment.save();

//   const updatedAppointment = await Appointment.findById(id)
//     .populate('patient', 'name email')
//     .populate('doctor', 'name email specialty');

//   ResponseUtil.success(res, updatedAppointment, 'Appointment cancelled successfully');
// });

// /**
//  * @swagger
//  * /api/v1/appointments/{id}/reschedule:
//  *   post:
//  *     summary: Reschedule appointment
//  *     tags: [Appointments]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - newDate
//  *             properties:
//  *               newDate:
//  *                 type: string
//  *                 format: date-time
//  *               reason:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Appointment rescheduled successfully
//  */
// export const rescheduleAppointment = asyncHandler(async (req: Request, res: Response) => {
//   if (!req.user) {
//     throw new AppError('Authentication required', 401);
//   }

//   const { id } = req.params;
//   const { newDate, reason } = req.body;

//   const appointment = await Appointment.findById(id);
//   if (!appointment) {
//     throw new AppError('Appointment not found', 404);
//   }

//   // Check authorization
//   const isPatient = req.user.role === UserRole.PATIENT && appointment.patient.toString() === req.user.userId;
//   const isDoctor = req.user.role === UserRole.DOCTOR && appointment.doctor.toString() === req.user.userId;
//   const isAdmin = req.user.role === UserRole.ADMIN;

//   if (!isPatient && !isDoctor && !isAdmin) {
//     throw new AppError('Access denied', 403);
//   }

//   // Check if appointment can be rescheduled
//   if (!appointment.canBeRescheduled()) {
//     throw new AppError('This appointment cannot be rescheduled', 400);
//   }

//   // Check for conflicts at new time
//   const conflictingAppointment = await Appointment.findOne({
//     _id: { $ne: id },
//     doctor: appointment.doctor,
//     appointmentDate: {
//       $gte: new Date(newDate),
//       $lt: new Date(new Date(newDate).getTime() + appointment.duration * 60000)
//     },
//     status: { $in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS] }
//   });

//   if (conflictingAppointment) {
//     throw new AppError('Doctor is not available at the requested time', 409);
//   }

//   // Store original appointment reference
//   const originalAppointmentId = appointment._id;

//   // Update appointment
//   appointment.appointmentDate = new Date(newDate);
//   appointment.status = AppointmentStatus.RESCHEDULED;
//   appointment.rescheduledFrom = originalAppointmentId;
//   if (reason) {
//     appointment.notes = appointment.notes ? `${appointment.notes}\n\nRescheduled: ${reason}` : `Rescheduled: ${reason}`;
//   }

//   await appointment.save();

//   const updatedAppointment = await Appointment.findById(id)
//     .populate('patient', 'name email')
//     .populate('doctor', 'name email specialty');

//   ResponseUtil.success(res, updatedAppointment, 'Appointment rescheduled successfully');
// });

// /**
//  * @swagger
//  * /api/v1/appointments/{id}/complete:
//  *   post:
//  *     summary: Complete appointment (doctors only)
//  *     tags: [Appointments]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     requestBody:
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               doctorNotes:
//  *                 type: string
//  *               diagnosis:
//  *                 type: string
//  *               prescription:
//  *                 type: string
//  *               vitals:
//  *                 type: object
//  *               followUpRequired:
//  *                 type: boolean
//  *               followUpDate:
//  *                 type: string
//  *                 format: date-time
//  *     responses:
//  *       200:
//  *         description: Appointment completed successfully
//  */
// export const completeAppointment = asyncHandler(async (req: Request, res: Response) => {
//   if (!req.user) {
//     throw new AppError('Authentication required', 401);
//   }

//   const { id } = req.params;
//   const { doctorNotes, diagnosis, prescription, vitals, followUpRequired, followUpDate } = req.body;

//   const appointment = await Appointment.findById(id);
//   if (!appointment) {
//     throw new AppError('Appointment not found', 404);
//   }

//   // Only the assigned doctor can complete the appointment
//   if (appointment.doctor.toString() !== req.user.userId) {
//     throw new AppError('Access denied. Only the assigned doctor can complete this appointment', 403);
//   }

//   // Update appointment with completion details
//   appointment.status = AppointmentStatus.COMPLETED;
//   appointment.doctorNotes = doctorNotes;
//   appointment.diagnosis = diagnosis;
//   appointment.prescription = prescription;
//   appointment.vitals = vitals;
//   appointment.followUpRequired = followUpRequired;
//   if (followUpDate) {
//     appointment.followUpDate = new Date(followUpDate);
//   }

//   await appointment.save();

//   const completedAppointment = await Appointment.findById(id)
//     .populate('patient', 'name email')
//     .populate('doctor', 'name email specialty');

//   ResponseUtil.success(res, completedAppointment, 'Appointment completed successfully');
// });

// /**
//  * @swagger
//  * /api/v1/appointments/availability:
//  *   get:
//  *     summary: Check doctor availability
//  *     tags: [Appointments]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: doctorId
//  *         required: true
//  *         schema:
//  *           type: string
//  *       - in: query
//  *         name: date
//  *         required: true
//  *         schema:
//  *           type: string
//  *           format: date
//  *       - in: query
//  *         name: duration
//  *         schema:
//  *           type: number
//  *           default: 30
//  *     responses:
//  *       200:
//  *         description: Available time slots
//  */
// export const checkDoctorAvailability = asyncHandler(async (req: Request, res: Response) => {
//   const { doctorId, date, duration = 30 } = req.query;

//   if (!doctorId || !date) {
//     throw new AppError('Doctor ID and date are required', 400);
//   }

//   // Validate doctor exists
//   const doctor = await User.findById(doctorId);
//   if (!doctor || doctor.role !== UserRole.DOCTOR) {
//     throw new AppError('Invalid doctor ID', 400);
//   }

//   const startDate = new Date(date as string);
//   const endDate = new Date(startDate);
//   endDate.setDate(endDate.getDate() + 1);

//   // Get existing appointments for the day
//   const existingAppointments = await Appointment.find({
//     doctor: doctorId,
//     appointmentDate: {
//       $gte: startDate,
//       $lt: endDate
//     },
//     status: { $in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS] }
//   }).sort({ appointmentDate: 1 });

//   // Generate available time slots (9 AM to 5 PM, excluding existing appointments)
//   const availableSlots = [];
//   const workStart = new Date(startDate);
//   workStart.setHours(9, 0, 0, 0);
//   const workEnd = new Date(startDate);
//   workEnd.setHours(17, 0, 0, 0);

//   let currentTime = new Date(workStart);

//   while (currentTime < workEnd) {
//     const slotEnd = new Date(currentTime.getTime() + Number(duration) * 60000);

//     // Check if this slot conflicts with existing appointments
//     const hasConflict = existingAppointments.some(apt => {
//       const aptStart = new Date(apt.appointmentDate);
//       const aptEnd = new Date(aptStart.getTime() + apt.duration * 60000);

//       return (currentTime < aptEnd && slotEnd > aptStart);
//     });

//     if (!hasConflict && slotEnd <= workEnd) {
//       availableSlots.push({
//         startTime: currentTime.toISOString(),
//         endTime: slotEnd.toISOString(),
//         duration: Number(duration)
//       });
//     }

//     currentTime = new Date(currentTime.getTime() + 30 * 60000); // 30-minute intervals
//   }

//   ResponseUtil.success(res, { availableSlots, date, doctorId });
// });

// /**
//  * @swagger
//  * /api/v1/appointments/stats:
//  *   get:
//  *     summary: Get appointment statistics (doctors and admins only)
//  *     tags: [Appointments]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: startDate
//  *         schema:
//  *           type: string
//  *           format: date
//  *       - in: query
//  *         name: endDate
//  *         schema:
//  *           type: string
//  *           format: date
//  *     responses:
//  *       200:
//  *         description: Appointment statistics
//  */
// export const getAppointmentStats = asyncHandler(async (req: Request, res: Response) => {
//   if (!req.user) {
//     throw new AppError('Authentication required', 401);
//   }

//   const { startDate, endDate } = req.query;

//   let query: any = {};

//   // If doctor, only show their stats
//   if (req.user.role === UserRole.DOCTOR) {
//     query.doctor = req.user.userId;
//   }

//   // Apply date filter if provided
//   if (startDate || endDate) {
//     query.appointmentDate = {};
//     if (startDate) query.appointmentDate.$gte = new Date(startDate as string);
//     if (endDate) query.appointmentDate.$lte = new Date(endDate as string);
//   }

//   const [
//     totalAppointments,
//     scheduledAppointments,
//     completedAppointments,
//     cancelledAppointments,
//     statusBreakdown,
//     typeBreakdown
//   ] = await Promise.all([
//     Appointment.countDocuments(query),
//     Appointment.countDocuments({ ...query, status: AppointmentStatus.SCHEDULED }),
//     Appointment.countDocuments({ ...query, status: AppointmentStatus.COMPLETED }),
//     Appointment.countDocuments({ ...query, status: AppointmentStatus.CANCELLED }),
//     Appointment.aggregate([
//       { $match: query },
//       { $group: { _id: '$status', count: { $sum: 1 } } }
//     ]),
//     Appointment.aggregate([
//       { $match: query },
//       { $group: { _id: '$type', count: { $sum: 1 } } }
//     ])
//   ]);

//   const stats = {
//     total: totalAppointments,
//     scheduled: scheduledAppointments,
//     completed: completedAppointments,
//     cancelled: cancelledAppointments,
//     statusBreakdown: statusBreakdown.reduce((acc, item) => {
//       acc[item._id] = item.count;
//       return acc;
//     }, {}),
//     typeBreakdown: typeBreakdown.reduce((acc, item) => {
//       acc[item._id] = item.count;
//       return acc;
//     }, {})
//   };

//   ResponseUtil.success(res, stats);
// });

// /**
//  * @swagger
//  * /api/v1/appointments/user/{userId}:
//  *   get:
//  *     summary: Get appointments for a specific user
//  *     tags: [Appointments]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: userId
//  *         required: true
//  *         schema:
//  *           type: string
//  *       - in: query
//  *         name: page
//  *         schema:
//  *           type: integer
//  *           default: 1
//  *       - in: query
//  *         name: limit
//  *         schema:
//  *           type: integer
//  *           default: 10
//  *     responses:
//  *       200:
//  *         description: User's appointments
//  */
// export const getUserAppointments = asyncHandler(async (req: Request, res: Response) => {
//   if (!req.user) {
//     throw new AppError('Authentication required', 401);
//   }

//   const { userId } = req.params;
//   const { page = 1, limit = 10 } = req.query;
//   const skip = (Number(page) - 1) * Number(limit);

//   // Check if user exists
//   const user = await User.findById(userId);
//   if (!user) {
//     throw new AppError('User not found', 404);
//   }

//   // Build query based on user role
//   let query: any = {};
//   if (user.role === UserRole.PATIENT) {
//     query.patient = userId;
//   } else if (user.role === UserRole.DOCTOR) {
//     query.doctor = userId;
//   } else {
//     throw new AppError('Invalid user role for appointments', 400);
//   }

//   const [appointments, total] = await Promise.all([
//     Appointment.find(query)
//       .populate('patient', 'name email')
//       .populate('doctor', 'name email specialty')
//       .sort({ appointmentDate: -1 })
//       .skip(skip)
//       .limit(Number(limit)),
//     Appointment.countDocuments(query)
//   ]);

//   ResponseUtil.success(res, {
//     appointments,
//     pagination: {
//       page: Number(page),
//       limit: Number(limit),
//       total,
//       totalPages: Math.ceil(total / Number(limit))
//     }
//   });
// });

// /**
//  * @swagger
//  * /api/v1/appointments/requests:
//  *   get:
//  *     summary: Get appointment requests (pending appointments)
//  *     tags: [Appointments]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: page
//  *         schema:
//  *           type: integer
//  *           default: 1
//  *         description: Page number
//  *       - in: query
//  *         name: limit
//  *         schema:
//  *           type: integer
//  *           default: 10
//  *         description: Number of items per page
//  *     responses:
//  *       200:
//  *         description: List of appointment requests
//  *       401:
//  *         description: Authentication required
//  *       403:
//  *         description: Access denied
//  */
// export const getAppointmentRequests = asyncHandler(async (req: Request, res: Response) => {
//   if (!req.user) {
//     throw new AppError('Authentication required', 401);
//   }

//   const { page = 1, limit = 10 } = req.query;
//   const skip = (Number(page) - 1) * Number(limit);

//   // Build query based on user role
//   let query: any = { status: 'scheduled' }; // Pending/requested appointments

//   if (req.user.role === UserRole.DOCTOR) {
//     query.doctor = req.user._id;
//   } else if (req.user.role === UserRole.PATIENT) {
//     query.patient = req.user._id;
//   }
//   // Admin can see all appointment requests

//   const appointments = await Appointment.find(query)
//     .populate('patient', 'name email phone')
//     .populate('doctor', 'name email specialization')
//     .sort({ appointmentDate: 1 })
//     .skip(skip)
//     .limit(Number(limit))
//     .lean();

//   const total = await Appointment.countDocuments(query);

//   ResponseUtil.success(res, {
//     appointments,
//     pagination: {
//       page: Number(page),
//       limit: Number(limit),
//       total,
//       totalPages: Math.ceil(total / Number(limit))
//     }
//   });
// });
