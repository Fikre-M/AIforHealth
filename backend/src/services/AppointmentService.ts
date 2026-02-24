import { Appointment, IAppointment, AppointmentStatus, AppointmentType } from '@/models';
import { UserService } from './UserService';
import { DatabaseUtil } from '@/utils/database';
import { UserRole } from '@/types';
import mongoose from 'mongoose';

export interface CreateAppointmentData {
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  duration?: number;
  type?: AppointmentType;
  reason: string;
  symptoms?: string[];
  notes?: string;
  isEmergency?: boolean;
}

export interface UpdateAppointmentData {
  appointmentDate?: Date;
  duration?: number;
  type?: AppointmentType;
  reason?: string;
  symptoms?: string[];
  notes?: string;
  doctorNotes?: string;
  prescription?: string;
  diagnosis?: string;
  status?: AppointmentStatus;
  followUpRequired?: boolean;
  followUpDate?: Date;
  isEmergency?: boolean;
}

export interface AppointmentQuery {
  page?: number;
  limit?: number;
  status?: AppointmentStatus;
  type?: AppointmentType;
  patientId?: string;
  doctorId?: string;
  startDate?: Date;
  endDate?: Date;
  isEmergency?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CancelAppointmentData {
  cancelledBy: string;
  cancellationReason: string;
}

export interface RescheduleAppointmentData {
  newDate: Date;
  reason?: string;
}

/**
 * Appointment service for handling appointment-related business logic
 */
export class AppointmentService {
  /**
   * Create a new appointment
   */
  static async createAppointment(appointmentData: CreateAppointmentData): Promise<IAppointment> {
    try {
      // Validate patient exists and is a patient
      const patient = await UserService.findUserById(appointmentData.patientId);
      if (!patient || patient.role !== UserRole.PATIENT) {
        throw new Error('Invalid patient ID or user is not a patient');
      }

      // Validate doctor exists and is a doctor
      const doctor = await UserService.findUserById(appointmentData.doctorId);
      if (!doctor || doctor.role !== UserRole.DOCTOR) {
        throw new Error('Invalid doctor ID or user is not a doctor');
      }

      // Check if appointment date is in the future
      if (appointmentData.appointmentDate <= new Date()) {
        throw new Error('Appointment date must be in the future');
      }

      // Use transaction to prevent race conditions
      const appointment = await DatabaseUtil.withTransaction(async (session) => {
        // Check for doctor availability within transaction
        const isAvailable = await this.checkDoctorAvailability(
          appointmentData.doctorId,
          appointmentData.appointmentDate,
          appointmentData.duration || 30
        );

        if (!isAvailable) {
          throw new Error('Doctor is not available at the requested time');
        }

        // Create appointment
        const newAppointment = new Appointment({
          patient: appointmentData.patientId,
          doctor: appointmentData.doctorId,
          appointmentDate: appointmentData.appointmentDate,
          duration: appointmentData.duration || 30,
          type: appointmentData.type || AppointmentType.CONSULTATION,
          reason: appointmentData.reason,
          symptoms: appointmentData.symptoms || [],
          notes: appointmentData.notes,
          isEmergency: appointmentData.isEmergency || false,
          status: appointmentData.isEmergency ? AppointmentStatus.CONFIRMED : AppointmentStatus.SCHEDULED,
        });

        await newAppointment.save({ session });
        return newAppointment;
      });

      // Populate references before returning
      await appointment.populate([
        { path: 'patient', select: 'name email' },
        { path: 'doctor', select: 'name email' }
      ]);

      return appointment;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create appointment: ${error.message}`);
      }
      throw new Error('Failed to create appointment: Unknown error');
    }
  }

  /**
   * Find appointment by ID
   */
  static async findAppointmentById(appointmentId: string): Promise<IAppointment | null> {
    try {
      if (!DatabaseUtil.isValidObjectId(appointmentId)) {
        throw new Error('Invalid appointment ID format');
      }

      return await Appointment.findById(appointmentId)
        .populate('patient', 'name email')
        .populate('doctor', 'name email')
        .populate('cancelledBy', 'name email');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to find appointment: ${error.message}`);
      }
      throw new Error('Failed to find appointment: Unknown error');
    }
  }

  /**
   * Update appointment
   */
  static async updateAppointment(
    appointmentId: string,
    updateData: UpdateAppointmentData
  ): Promise<IAppointment | null> {
    try {
      if (!DatabaseUtil.isValidObjectId(appointmentId)) {
        throw new Error('Invalid appointment ID format');
      }

      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        throw new Error('Appointment not found');
      }

      // Check if appointment can be updated
      if (appointment.status === AppointmentStatus.COMPLETED) {
        throw new Error('Cannot update completed appointment');
      }

      if (appointment.status === AppointmentStatus.CANCELLED) {
        throw new Error('Cannot update cancelled appointment');
      }

      // If updating appointment date, check availability
      if (updateData.appointmentDate) {
        const isAvailable = await this.checkDoctorAvailability(
          appointment.doctor.toString(),
          updateData.appointmentDate,
          updateData.duration || appointment.duration,
          appointmentId
        );

        if (!isAvailable) {
          throw new Error('Doctor is not available at the requested time');
        }
      }

      // Update appointment
      Object.assign(appointment, updateData);
      await appointment.save();

      // Populate references
      await appointment.populate([
        { path: 'patient', select: 'name email' },
        { path: 'doctor', select: 'name email' }
      ]);

      return appointment;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update appointment: ${error.message}`);
      }
      throw new Error('Failed to update appointment: Unknown error');
    }
  }

  /**
   * Cancel appointment
   */
  static async cancelAppointment(
    appointmentId: string,
    cancelData: CancelAppointmentData
  ): Promise<IAppointment | null> {
    try {
      if (!DatabaseUtil.isValidObjectId(appointmentId)) {
        throw new Error('Invalid appointment ID format');
      }

      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        throw new Error('Appointment not found');
      }

      // Check if appointment can be cancelled
      if (!appointment.canBeCancelled()) {
        throw new Error('Appointment cannot be cancelled (too close to appointment time or invalid status)');
      }

      // Update appointment status
      appointment.status = AppointmentStatus.CANCELLED;
      appointment.cancelledBy = new mongoose.Types.ObjectId(cancelData.cancelledBy);
      appointment.cancellationReason = cancelData.cancellationReason;

      await appointment.save();

      // Populate references
      await appointment.populate([
        { path: 'patient', select: 'name email' },
        { path: 'doctor', select: 'name email' },
        { path: 'cancelledBy', select: 'name email' }
      ]);

      return appointment;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to cancel appointment: ${error.message}`);
      }
      throw new Error('Failed to cancel appointment: Unknown error');
    }
  }

  /**
   * Reschedule appointment
   */
  static async rescheduleAppointment(
    appointmentId: string,
    rescheduleData: RescheduleAppointmentData
  ): Promise<IAppointment | null> {
    try {
      if (!DatabaseUtil.isValidObjectId(appointmentId)) {
        throw new Error('Invalid appointment ID format');
      }

      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        throw new Error('Appointment not found');
      }

      // Check if appointment can be rescheduled
      if (!appointment.canBeRescheduled()) {
        throw new Error('Appointment cannot be rescheduled (too close to appointment time or invalid status)');
      }

      // Check doctor availability for new date
      const isAvailable = await this.checkDoctorAvailability(
        appointment.doctor.toString(),
        rescheduleData.newDate,
        appointment.duration,
        appointmentId
      );

      if (!isAvailable) {
        throw new Error('Doctor is not available at the requested time');
      }

      // Use transaction to ensure both appointments are saved atomically
      const newAppointment = await DatabaseUtil.withTransaction(async (session) => {
        // Create new appointment with rescheduled data
        const newAppt = new Appointment({
          patient: appointment.patient,
          doctor: appointment.doctor,
          appointmentDate: rescheduleData.newDate,
          duration: appointment.duration,
          type: appointment.type,
          reason: appointment.reason,
          symptoms: appointment.symptoms,
          notes: rescheduleData.reason ? 
            `${appointment.notes || ''}\n\nRescheduled: ${rescheduleData.reason}`.trim() : 
            appointment.notes,
          isEmergency: appointment.isEmergency,
          rescheduledFrom: appointment._id,
        });

        // Mark original appointment as rescheduled
        appointment.status = AppointmentStatus.RESCHEDULED;
        
        // Save both appointments within transaction
        await appointment.save({ session });
        await newAppt.save({ session });

        return newAppt;
      });

      // Populate references for new appointment
      await newAppointment.populate([
        { path: 'patient', select: 'name email' },
        { path: 'doctor', select: 'name email' }
      ]);

      return newAppointment;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to reschedule appointment: ${error.message}`);
      }
      throw new Error('Failed to reschedule appointment: Unknown error');
    }
  }

  /**
   * Get appointments with filtering and pagination
   */
  static async getAppointments(query: AppointmentQuery = {}) {
    try {
      const {
        page = 1,
        limit = 20, // Default limit to prevent unbounded queries
        status,
        type,
        patientId,
        doctorId,
        startDate,
        endDate,
        isEmergency,
        sortBy = 'appointmentDate',
        sortOrder = 'asc'
      } = query;

      // Enforce maximum limit to prevent performance issues
      const maxLimit = 100;
      const effectiveLimit = Math.min(limit, maxLimit);

      // Build filter object
      const filter: any = {};
      
      if (status) filter.status = status;
      if (type) filter.type = type;
      if (patientId) filter.patient = patientId;
      if (doctorId) filter.doctor = doctorId;
      if (isEmergency !== undefined) filter.isEmergency = isEmergency;
      
      if (startDate || endDate) {
        filter.appointmentDate = {};
        if (startDate) filter.appointmentDate.$gte = startDate;
        if (endDate) filter.appointmentDate.$lte = endDate;
      }

      // Build sort object
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Calculate pagination
      const skip = (page - 1) * effectiveLimit;

      // Execute queries
      const [appointments, total] = await Promise.all([
        Appointment.find(filter)
          .populate('patient', 'name email')
          .populate('doctor', 'name email')
          .populate('cancelledBy', 'name email')
          .sort(sort)
          .skip(skip)
          .limit(effectiveLimit)
          .lean(),
        Appointment.countDocuments(filter)
      ]);

      return {
        appointments,
        pagination: {
          page,
          limit: effectiveLimit,
          total,
          pages: Math.ceil(total / effectiveLimit)
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get appointments: ${error.message}`);
      }
      throw new Error('Failed to get appointments: Unknown error');
    }
  }

  /**
   * Get upcoming appointments for a user
   */
  static async getUpcomingAppointments(userId: string, role: UserRole) {
    try {
      const filter: any = {
        appointmentDate: { $gte: new Date() },
        status: { $in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] }
      };

      if (role === UserRole.PATIENT) {
        filter.patient = userId;
      } else if (role === UserRole.DOCTOR) {
        filter.doctor = userId;
      }

      return await Appointment.find(filter)
        .populate('patient', 'name email')
        .populate('doctor', 'name email')
        .sort({ appointmentDate: 1 });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get upcoming appointments: ${error.message}`);
      }
      throw new Error('Failed to get upcoming appointments: Unknown error');
    }
  }

  /**
   * Check doctor availability
   */
  static async checkDoctorAvailability(
    doctorId: string,
    appointmentDate: Date,
    duration: number,
    excludeAppointmentId?: string
  ): Promise<boolean> {
    try {
      const startTime = appointmentDate;
      const endTime = new Date(appointmentDate.getTime() + (duration * 60000));

      // Find any appointments that overlap with the requested time slot
      // An appointment overlaps if:
      // 1. It starts before our end time AND
      // 2. It ends after our start time
      const filter: any = {
        doctor: doctorId,
        status: { $in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS] }
      };

      if (excludeAppointmentId) {
        filter._id = { $ne: excludeAppointmentId };
      }

      // Get all active appointments for this doctor
      const appointments = await Appointment.find(filter).select('appointmentDate duration').lean();

      // Check for overlaps manually for better reliability
      for (const appt of appointments) {
        const apptStart = new Date(appt.appointmentDate);
        const apptEnd = new Date(apptStart.getTime() + (appt.duration * 60000));

        // Check if time slots overlap
        if (apptStart < endTime && apptEnd > startTime) {
          return false; // Conflict found
        }
      }

      return true; // No conflicts
    } catch (error) {
      console.error('Error checking doctor availability:', error);
      return false;
    }
  }

  /**
   * Get appointment statistics
   */
  static async getAppointmentStats(doctorId?: string) {
    try {
      const matchStage: any = {};
      if (doctorId) {
        matchStage.doctor = new mongoose.Types.ObjectId(doctorId);
      }

      const stats = await Appointment.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalAppointments: { $sum: 1 },
            scheduledCount: {
              $sum: { $cond: [{ $eq: ['$status', AppointmentStatus.SCHEDULED] }, 1, 0] }
            },
            confirmedCount: {
              $sum: { $cond: [{ $eq: ['$status', AppointmentStatus.CONFIRMED] }, 1, 0] }
            },
            completedCount: {
              $sum: { $cond: [{ $eq: ['$status', AppointmentStatus.COMPLETED] }, 1, 0] }
            },
            cancelledCount: {
              $sum: { $cond: [{ $eq: ['$status', AppointmentStatus.CANCELLED] }, 1, 0] }
            },
            missedCount: {
              $sum: { $cond: [{ $eq: ['$status', AppointmentStatus.MISSED] }, 1, 0] }
            },
            emergencyCount: {
              $sum: { $cond: ['$isEmergency', 1, 0] }
            },
            averageDuration: { $avg: '$duration' },
            totalRevenue: { $sum: '$amount' }
          }
        }
      ]);

      return stats[0] || {
        totalAppointments: 0,
        scheduledCount: 0,
        confirmedCount: 0,
        completedCount: 0,
        cancelledCount: 0,
        missedCount: 0,
        emergencyCount: 0,
        averageDuration: 0,
        totalRevenue: 0
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get appointment stats: ${error.message}`);
      }
      throw new Error('Failed to get appointment stats: Unknown error');
    }
  }

  /**
   * Complete appointment
   */
  static async completeAppointment(
    appointmentId: string,
    completionData: {
      doctorNotes?: string;
      prescription?: string;
      diagnosis?: string;
      followUpRequired?: boolean;
      followUpDate?: Date;
    }
  ): Promise<IAppointment | null> {
    try {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        throw new Error('Appointment not found');
      }

      if (appointment.status !== AppointmentStatus.IN_PROGRESS && 
          appointment.status !== AppointmentStatus.CONFIRMED) {
        throw new Error('Only confirmed or in-progress appointments can be completed');
      }

      // Update appointment with completion data
      appointment.status = AppointmentStatus.COMPLETED;
      appointment.doctorNotes = completionData.doctorNotes;
      appointment.prescription = completionData.prescription;
      appointment.diagnosis = completionData.diagnosis;
      appointment.followUpRequired = completionData.followUpRequired || false;
      appointment.followUpDate = completionData.followUpDate;

      await appointment.save();

      // Populate references
      await appointment.populate([
        { path: 'patient', select: 'name email' },
        { path: 'doctor', select: 'name email' }
      ]);

      return appointment;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to complete appointment: ${error.message}`);
      }
      throw new Error('Failed to complete appointment: Unknown error');
    }
  }
}