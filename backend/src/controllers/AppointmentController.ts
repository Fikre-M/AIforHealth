import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AppointmentService } from '@/services';
import { ResponseUtil, asyncHandler } from '@/utils';
import { UserRole, AppointmentStatus, AppointmentType } from '@/types';

/**
 * Appointment controller for handling appointment-related HTTP requests
 */
export class AppointmentController {
  /**
   * Create a new appointment
   */
  static createAppointment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      ResponseUtil.error(res, 'Validation failed', 400, errors.array());
      return;
    }

    const {
      patientId,
      doctorId,
      appointmentDate,
      duration,
      type,
      reason,
      symptoms,
      notes,
      isEmergency
    } = req.body;

    // Check if user has permission to create appointment
    const currentUser = req.user!;
    if (currentUser.role === UserRole.PATIENT && currentUser.userId !== patientId) {
      ResponseUtil.error(res, 'Patients can only create appointments for themselves', 403);
      return;
    }

    if (currentUser.role === UserRole.DOCTOR && currentUser.userId !== doctorId) {
      ResponseUtil.error(res, 'Doctors can only create appointments for themselves', 403);
      return;
    }

    const appointment = await AppointmentService.createAppointment({
      patientId,
      doctorId,
      appointmentDate: new Date(appointmentDate),
      duration,
      type,
      reason,
      symptoms,
      notes,
      isEmergency
    });

    ResponseUtil.success(res, appointment, 'Appointment created successfully', 201);
  });

  /**
   * Get appointments with filtering and pagination
   */
  static getAppointments = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      patientId,
      doctorId,
      startDate,
      endDate,
      isEmergency,
      sortBy,
      sortOrder
    } = req.query;

    const currentUser = req.user!;
    let queryPatientId = patientId as string;
    let queryDoctorId = doctorId as string;

    // Apply role-based filtering
    if (currentUser.role === UserRole.PATIENT) {
      queryPatientId = currentUser.userId; // Patients can only see their own appointments
      queryDoctorId = undefined as any; // Clear doctor filter for patients
    } else if (currentUser.role === UserRole.DOCTOR) {
      queryDoctorId = currentUser.userId; // Doctors can only see their own appointments
      // Doctors can filter by patient, but only for their own appointments
    }
    // Admins can see all appointments without restrictions

    const result = await AppointmentService.getAppointments({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      status: status as AppointmentStatus,
      type: type as AppointmentType,
      patientId: queryPatientId,
      doctorId: queryDoctorId,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      isEmergency: isEmergency === 'true' ? true : isEmergency === 'false' ? false : undefined,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    ResponseUtil.paginated(
      res,
      result.appointments,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total
    );
  });

  /**
   * Get user's appointments (upcoming, past, etc.)
   */
  static getUserAppointments = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    const { type = 'upcoming' } = req.query;
    const currentUser = req.user!;

    // Check permissions
    if (currentUser.role === UserRole.PATIENT && currentUser.userId !== userId) {
      ResponseUtil.error(res, 'Patients can only access their own appointments', 403);
      return;
    }

    if (currentUser.role === UserRole.DOCTOR && currentUser.userId !== userId) {
      ResponseUtil.error(res, 'Doctors can only access their own appointments', 403);
      return;
    }

    let appointments;
    
    if (type === 'upcoming') {
      appointments = await AppointmentService.getUpcomingAppointments(userId, currentUser.role);
    } else {
      // Get all appointments with filtering
      const result = await AppointmentService.getAppointments({
        patientId: currentUser.role === UserRole.PATIENT ? userId : undefined,
        doctorId: currentUser.role === UserRole.DOCTOR ? userId : undefined,
        page: 1,
        limit: 100, // Get more for user's own appointments
        sortBy: 'appointmentDate',
        sortOrder: 'desc'
      });
      appointments = result.appointments;
    }

    ResponseUtil.success(res, appointments, 'User appointments retrieved successfully');
  });

  /**
   * Get appointment by ID
   */
  static getAppointmentById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const currentUser = req.user!;

    const appointment = await AppointmentService.findAppointmentById(id);
    if (!appointment) {
      ResponseUtil.error(res, 'Appointment not found', 404);
      return;
    }

    // Check permissions
    const isPatient = currentUser.role === UserRole.PATIENT && 
                     appointment.patient._id.toString() === currentUser.userId;
    const isDoctor = currentUser.role === UserRole.DOCTOR && 
                    appointment.doctor._id.toString() === currentUser.userId;
    const isAdmin = currentUser.role === UserRole.ADMIN;

    if (!isPatient && !isDoctor && !isAdmin) {
      ResponseUtil.error(res, 'Access denied', 403);
      return;
    }

    ResponseUtil.success(res, appointment, 'Appointment retrieved successfully');
  });

  /**
   * Update appointment
   */
  static updateAppointment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      ResponseUtil.error(res, 'Validation failed', 400, errors.array());
      return;
    }

    const { id } = req.params;
    const currentUser = req.user!;
    const updateData = req.body;

    // Get existing appointment to check permissions
    const existingAppointment = await AppointmentService.findAppointmentById(id);
    if (!existingAppointment) {
      ResponseUtil.error(res, 'Appointment not found', 404);
      return;
    }

    // Check permissions
    const isPatient = currentUser.role === UserRole.PATIENT && 
                     existingAppointment.patient._id.toString() === currentUser.userId;
    const isDoctor = currentUser.role === UserRole.DOCTOR && 
                    existingAppointment.doctor._id.toString() === currentUser.userId;
    const isAdmin = currentUser.role === UserRole.ADMIN;

    if (!isPatient && !isDoctor && !isAdmin) {
      ResponseUtil.error(res, 'Access denied', 403);
      return;
    }

    // Restrict what patients can update
    if (currentUser.role === UserRole.PATIENT) {
      const allowedFields = ['notes', 'symptoms'];
      const updateFields = Object.keys(updateData);
      const invalidFields = updateFields.filter(field => !allowedFields.includes(field));
      
      if (invalidFields.length > 0) {
        ResponseUtil.error(res, `Patients can only update: ${allowedFields.join(', ')}`, 403);
        return;
      }
    }

    // Convert date strings to Date objects
    if (updateData.appointmentDate) {
      updateData.appointmentDate = new Date(updateData.appointmentDate);
    }
    if (updateData.followUpDate) {
      updateData.followUpDate = new Date(updateData.followUpDate);
    }

    const appointment = await AppointmentService.updateAppointment(id, updateData, currentUser.userId);

    ResponseUtil.success(res, appointment, 'Appointment updated successfully');
  });

  /**
   * Update appointment status
   */
  static updateAppointmentStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status } = req.body;
    const currentUser = req.user!;

    if (!status) {
      ResponseUtil.error(res, 'Status is required', 400);
      return;
    }

    if (!Object.values(AppointmentStatus).includes(status)) {
      ResponseUtil.error(res, 'Invalid appointment status', 400);
      return;
    }

    // Get existing appointment to check permissions
    const existingAppointment = await AppointmentService.findAppointmentById(id);
    if (!existingAppointment) {
      ResponseUtil.error(res, 'Appointment not found', 404);
      return;
    }

    // Only doctors and admins can update status (except for patient cancellation)
    const isDoctor = currentUser.role === UserRole.DOCTOR && 
                    existingAppointment.doctor._id.toString() === currentUser.userId;
    const isAdmin = currentUser.role === UserRole.ADMIN;
    const isPatientCancelling = currentUser.role === UserRole.PATIENT && 
                               existingAppointment.patient._id.toString() === currentUser.userId &&
                               status === AppointmentStatus.CANCELLED;

    if (!isDoctor && !isAdmin && !isPatientCancelling) {
      ResponseUtil.error(res, 'Only doctors can update appointment status (patients can only cancel)', 403);
      return;
    }

    const appointment = await AppointmentService.updateAppointment(
      id, 
      { status }, 
      currentUser.userId
    );

    ResponseUtil.success(res, appointment, 'Appointment status updated successfully');
  });

  /**
   * Cancel appointment
   */
  static cancelAppointment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      ResponseUtil.error(res, 'Validation failed', 400, errors.array());
      return;
    }

    const { id } = req.params;
    const { cancellationReason } = req.body;
    const currentUser = req.user!;

    // Get existing appointment to check permissions
    const existingAppointment = await AppointmentService.findAppointmentById(id);
    if (!existingAppointment) {
      ResponseUtil.error(res, 'Appointment not found', 404);
      return;
    }

    // Check permissions
    const isPatient = currentUser.role === UserRole.PATIENT && 
                     existingAppointment.patient._id.toString() === currentUser.userId;
    const isDoctor = currentUser.role === UserRole.DOCTOR && 
                    existingAppointment.doctor._id.toString() === currentUser.userId;
    const isAdmin = currentUser.role === UserRole.ADMIN;

    if (!isPatient && !isDoctor && !isAdmin) {
      ResponseUtil.error(res, 'Access denied', 403);
      return;
    }

    const appointment = await AppointmentService.cancelAppointment(id, {
      cancelledBy: currentUser.userId,
      cancellationReason
    });

    ResponseUtil.success(res, appointment, 'Appointment cancelled successfully');
  });

  /**
   * Reschedule appointment
   */
  static rescheduleAppointment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      ResponseUtil.error(res, 'Validation failed', 400, errors.array());
      return;
    }

    const { id } = req.params;
    const { newDate, reason } = req.body;
    const currentUser = req.user!;

    // Get existing appointment to check permissions
    const existingAppointment = await AppointmentService.findAppointmentById(id);
    if (!existingAppointment) {
      ResponseUtil.error(res, 'Appointment not found', 404);
      return;
    }

    // Check permissions
    const isPatient = currentUser.role === UserRole.PATIENT && 
                     existingAppointment.patient._id.toString() === currentUser.userId;
    const isDoctor = currentUser.role === UserRole.DOCTOR && 
                    existingAppointment.doctor._id.toString() === currentUser.userId;
    const isAdmin = currentUser.role === UserRole.ADMIN;

    if (!isPatient && !isDoctor && !isAdmin) {
      ResponseUtil.error(res, 'Access denied', 403);
      return;
    }

    const appointment = await AppointmentService.rescheduleAppointment(id, {
      newDate: new Date(newDate),
      reason
    });

    ResponseUtil.success(res, appointment, 'Appointment rescheduled successfully', 201);
  });

  /**
   * Complete appointment (doctors only)
   */
  static completeAppointment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      ResponseUtil.error(res, 'Validation failed', 400, errors.array());
      return;
    }

    const { id } = req.params;
    const { doctorNotes, prescription, diagnosis, followUpRequired, followUpDate } = req.body;
    const currentUser = req.user!;

    // Only doctors and admins can complete appointments
    if (currentUser.role !== UserRole.DOCTOR && currentUser.role !== UserRole.ADMIN) {
      ResponseUtil.error(res, 'Only doctors can complete appointments', 403);
      return;
    }

    // Get existing appointment to check if doctor owns it
    const existingAppointment = await AppointmentService.findAppointmentById(id);
    if (!existingAppointment) {
      ResponseUtil.error(res, 'Appointment not found', 404);
      return;
    }

    if (currentUser.role === UserRole.DOCTOR && 
        existingAppointment.doctor._id.toString() !== currentUser.userId) {
      ResponseUtil.error(res, 'Doctors can only complete their own appointments', 403);
      return;
    }

    const appointment = await AppointmentService.completeAppointment(id, {
      doctorNotes,
      prescription,
      diagnosis,
      followUpRequired,
      followUpDate: followUpDate ? new Date(followUpDate) : undefined
    });

    ResponseUtil.success(res, appointment, 'Appointment completed successfully');
  });

  /**
   * Get appointment statistics
   */
  static getAppointmentStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user!;
    let doctorId: string | undefined;

    // Role-based filtering
    if (currentUser.role === UserRole.DOCTOR) {
      doctorId = currentUser.userId;
    } else if (currentUser.role === UserRole.PATIENT) {
      ResponseUtil.error(res, 'Patients cannot access appointment statistics', 403);
      return;
    }
    // Admins can see all stats (doctorId remains undefined)

    const stats = await AppointmentService.getAppointmentStats(doctorId);

    ResponseUtil.success(res, stats, 'Appointment statistics retrieved successfully');
  });

  /**
   * Check doctor availability
   */
  static checkDoctorAvailability = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { doctorId, date, duration = 30 } = req.query;

    if (!doctorId || !date) {
      ResponseUtil.error(res, 'Doctor ID and date are required', 400);
      return;
    }

    const appointmentDate = new Date(date as string);
    if (isNaN(appointmentDate.getTime())) {
      ResponseUtil.error(res, 'Invalid date format', 400);
      return;
    }

    const isAvailable = await AppointmentService.checkDoctorAvailability(
      doctorId as string,
      appointmentDate,
      parseInt(duration as string)
    );

    ResponseUtil.success(res, { 
      available: isAvailable,
      doctorId,
      date: appointmentDate,
      duration: parseInt(duration as string)
    }, 'Doctor availability checked successfully');
  });
}