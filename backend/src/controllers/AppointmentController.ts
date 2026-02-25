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
        const formattedErrors = errors.array().map((err: any) => ({
          param: err.path || err.param || err.location || 'unknown',
          msg: err.msg || err.message || 'Validation error',
          value: err.value
        }));
        return ResponseUtil.validationError(res, formattedErrors);
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
      const formattedErrors = errors.array().map((err: any) => ({
        param: err.path || err.param || err.location || 'unknown',
        msg: err.msg || err.message || 'Validation error',
        value: err.value
      }));
      return ResponseUtil.validationError(res, formattedErrors);
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
      const formattedErrors = errors.array().map((err: any) => ({
        param: err.path || err.param || err.location || 'unknown',
        msg: err.msg || err.message || 'Validation error',
        value: err.value
      }));
      return ResponseUtil.validationError(res, formattedErrors);
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
      const formattedErrors = errors.array().map((err: any) => ({
        param: err.path || err.param || err.location || 'unknown',
        msg: err.msg || err.message || 'Validation error',
        value: err.value
      }));
      return ResponseUtil.validationError(res, formattedErrors);
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

  /**
   * Check doctor availability
   */
  static async checkDoctorAvailability(req: Request, res: Response) {
    const { doctorId, date, startTime, endTime } = req.query;

    try {
      const isAvailable = await AppointmentService.checkDoctorAvailability(
        doctorId as string,
        date as string,
        startTime as string,
        endTime as string
      );

      return ResponseUtil.success(res, { available: isAvailable }, 'Availability checked successfully');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get appointment requests (pending appointments)
   */
  static async getAppointmentRequests(req: Request, res: Response) {
    const { page = 1, limit = 10, status = 'pending' } = req.query;

    const result = await AppointmentService.getAppointments({
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
      'Appointment requests retrieved successfully'
    );
  }

  /**
   * Get user appointments (patient or doctor)
   */
  static async getUserAppointments(req: Request, res: Response) {
    const { userId } = req.params;
    const { page = 1, limit = 10, role = 'patient' } = req.query;

    const result = role === 'doctor' 
      ? await AppointmentService.getDoctorAppointments(userId, {
          page: Number(page),
          limit: Number(limit),
        })
      : await AppointmentService.getPatientAppointments(userId, {
          page: Number(page),
          limit: Number(limit),
        });

    return ResponseUtil.paginated(
      res,
      result.appointments,
      {
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
      },
      'User appointments retrieved successfully'
    );
  }

  /**
   * Update appointment status
   */
  static async updateAppointmentStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await AppointmentService.updateAppointmentStatus(id, status);

    if (!appointment) {
      throw new NotFoundError('Appointment');
    }

    return ResponseUtil.success(res, appointment, 'Appointment status updated successfully');
  }
}