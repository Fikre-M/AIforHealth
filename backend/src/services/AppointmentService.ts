import Appointment from '@/models/Appointment';
import { AppError } from '@/middleware/errorHandler';

export interface PaginatedResult<T> {
  appointments: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class AppointmentService {
  /**
   * Create new appointment
   */
  static async createAppointment(data: any): Promise<any> {
    // Check for conflicts
    const existingAppointment = await Appointment.findOne({
      doctor: data.doctorId,
      appointmentDate: data.appointmentDate,
      status: { $ne: 'cancelled' },
    });

    if (existingAppointment) {
      throw new AppError('Time slot already booked', 409);
    }

    const appointment = await Appointment.create({
      patient: data.patientId,
      doctor: data.doctorId,
      appointmentDate: data.appointmentDate,
      duration: data.duration,
      type: data.type,
      reason: data.reason,
      notes: data.notes,
      isEmergency: data.isEmergency,
    });
    return appointment;
  }

  /**
   * Get appointment by ID
   */
  static async getAppointmentById(id: string): Promise<any | null> {
    return Appointment.findById(id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email specialization');
  }

  /**
   * Get appointments with pagination
   */
  static async getAppointments(filters: any): Promise<PaginatedResult<any>> {
    const { page, limit, status, startDate, endDate } = filters;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.appointmentDate = {};
      if (startDate) query.appointmentDate.$gte = new Date(startDate);
      if (endDate) query.appointmentDate.$lte = new Date(endDate);
    }

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .skip(skip)
        .limit(limit)
        .populate('patient', 'name email')
        .populate('doctor', 'name email')
        .sort({ appointmentDate: 1 }),
      Appointment.countDocuments(query),
    ]);

    return {
      appointments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update appointment
   */
  static async updateAppointment(id: string, data: any): Promise<any | null> {
    return Appointment.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
  }

  /**
   * Update appointment status
   */
  static async updateAppointmentStatus(id: string, status: string): Promise<any | null> {
    return Appointment.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    ).populate('patient', 'name email')
     .populate('doctor', 'name email');
  }

  /**
   * Cancel appointment
   */
  static async cancelAppointment(id: string, reason?: string): Promise<any | null> {
    return Appointment.findByIdAndUpdate(
      id,
      {
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt: new Date(),
      },
      { new: true }
    );
  }

  /**
   * Reschedule appointment
   */
  static async rescheduleAppointment(
    id: string,
    newDate: Date,
    reason?: string
  ): Promise<any | null> {
    // Check if new slot is available
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    const conflictingAppointment = await Appointment.findOne({
      doctor: appointment.doctor,
      appointmentDate: newDate,
      status: { $ne: 'cancelled' },
      _id: { $ne: id },
    });

    if (conflictingAppointment) {
      throw new AppError('New time slot is not available', 409);
    }

    return Appointment.findByIdAndUpdate(
      id,
      {
        appointmentDate: newDate,
        status: 'rescheduled',
        rescheduleReason: reason,
        rescheduledAt: new Date(),
      },
      { new: true }
    );
  }

  /**
   * Complete appointment
   */
  static async completeAppointment(id: string, data: any): Promise<any | null> {
    return Appointment.findByIdAndUpdate(
      id,
      {
        status: 'completed',
        completedAt: new Date(),
        notes: data.notes,
        diagnosis: data.diagnosis,
        prescription: data.prescription,
      },
      { new: true }
    );
  }

  /**
   * Get doctor's appointments
   */
  static async getDoctorAppointments(
    doctorId: string,
    options: any
  ): Promise<PaginatedResult<any>> {
    const { page, limit, date } = options;
    const skip = (page - 1) * limit;

    const query: any = { doctor: doctorId };

    if (date) {
      const startDate = new Date(date as string);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date as string);
      endDate.setHours(23, 59, 59, 999);

      query.appointmentDate = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .skip(skip)
        .limit(limit)
        .populate('patient', 'name email phone')
        .sort({ appointmentDate: 1 }),
      Appointment.countDocuments(query),
    ]);

    return {
      appointments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get patient's appointments
   */
  static async getPatientAppointments(
    patientId: string,
    options: any
  ): Promise<PaginatedResult<any>> {
    const { page, limit, status } = options;
    const skip = (page - 1) * limit;

    const query: any = { patient: patientId };
    if (status) {
      query.status = status;
    }

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .skip(skip)
        .limit(limit)
        .populate('doctor', 'name email specialization')
        .sort({ appointmentDate: -1 }),
      Appointment.countDocuments(query),
    ]);

    return {
      appointments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get appointment statistics
   */
  static async getAppointmentStatistics(filters: any): Promise<any> {
    const { startDate, endDate, doctorId } = filters;

    const matchStage: any = {};

    if (startDate || endDate) {
      matchStage.appointmentDate = {};
      if (startDate) matchStage.appointmentDate.$gte = new Date(startDate);
      if (endDate) matchStage.appointmentDate.$lte = new Date(endDate);
    }

    if (doctorId) {
      matchStage.doctor = doctorId;
    }

    const statistics = await Appointment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const total = statistics.reduce((acc, curr) => acc + curr.count, 0);
    const byStatus = statistics.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    return {
      total,
      byStatus,
      period: {
        startDate: startDate || 'all',
        endDate: endDate || 'all',
      },
    };
  }

  /**
   * Bulk update appointments
   */
  static async bulkUpdateAppointments(operation: string, appointments: any[]): Promise<any> {
    const results = {
      successful: [],
      failed: [],
    };

    for (const item of appointments) {
      try {
        let result;
        switch (operation) {
          case 'cancel':
            result = await this.cancelAppointment(item.id, item.reason);
            break;
          case 'complete':
            result = await this.completeAppointment(item.id, item.data);
            break;
          default:
            throw new AppError(`Unsupported operation: ${operation}`, 400);
        }

        if (result) {
          results.successful.push(result);
        } else {
          results.failed.push({ id: item.id, reason: 'Appointment not found' });
        }
      } catch (error: any) {
        results.failed.push({ id: item.id, reason: error.message });
      }
    }

    return results;
  }

  /**
   * Export appointments
   */
  static async exportAppointments(options: any): Promise<any> {
    const { format, startDate, endDate } = options;

    const query: any = {};

    if (startDate || endDate) {
      query.appointmentDate = {};
      if (startDate) query.appointmentDate.$gte = new Date(startDate);
      if (endDate) query.appointmentDate.$lte = new Date(endDate);
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email')
      .populate('doctor', 'name email')
      .sort({ appointmentDate: 1 });

    if (format === 'csv') {
      return this.convertToCSV(appointments);
    }

    return appointments;
  }

  /**
   * Convert appointments to CSV
   */
  private static convertToCSV(appointments: any[]): string {
    const headers = ['ID', 'Date', 'Patient', 'Doctor', 'Status', 'Type', 'Duration'];
    const rows = appointments.map((a) => [
      a._id,
      a.appointmentDate.toISOString(),
      a.patient?.name || 'Unknown',
      a.doctor?.name || 'Unknown',
      a.status,
      a.type,
      a.duration,
    ]);

    return [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join(
      '\n'
    );
  }

  /**
   * Check doctor availability
   */
  static async checkDoctorAvailability(
    doctorId: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<boolean> {
    try {
      const appointmentDate = new Date(`${date}T${startTime}`);
      const appointmentEndDate = new Date(`${date}T${endTime}`);

      // Find any appointments that overlap with the requested time slot
      const conflictingAppointment = await Appointment.findOne({
        doctor: doctorId,
        appointmentDate: {
          $gte: appointmentDate,
          $lt: appointmentEndDate,
        },
        status: { $in: ['scheduled', 'confirmed', 'in_progress'] },
      });

      return !conflictingAppointment;
    } catch (error) {
      console.error('Error checking doctor availability:', error);
      return false;
    }
  }
}

// import { Appointment, IAppointment, AppointmentStatus, AppointmentType } from '@/models';
// import { UserService } from './UserService';
// import { DatabaseUtil } from '@/utils/database';
// import { UserRole } from '@/types';
// import { logAppointment } from '@/utils/logger';
// import mongoose from 'mongoose';

// export interface CreateAppointmentData {
//   patientId: string;
//   doctorId: string;
//   appointmentDate: Date;
//   duration?: number;
//   type?: AppointmentType;
//   reason: string;
//   symptoms?: string[];
//   notes?: string;
//   isEmergency?: boolean;
// }

// export interface UpdateAppointmentData {
//   appointmentDate?: Date;
//   duration?: number;
//   type?: AppointmentType;
//   reason?: string;
//   symptoms?: string[];
//   notes?: string;
//   doctorNotes?: string;
//   prescription?: string;
//   diagnosis?: string;
//   status?: AppointmentStatus;
//   followUpRequired?: boolean;
//   followUpDate?: Date;
//   isEmergency?: boolean;
// }

// export interface AppointmentQuery {
//   page?: number;
//   limit?: number;
//   status?: AppointmentStatus;
//   type?: AppointmentType;
//   patientId?: string;
//   doctorId?: string;
//   startDate?: Date;
//   endDate?: Date;
//   isEmergency?: boolean;
//   sortBy?: string;
//   sortOrder?: 'asc' | 'desc';
// }

// export interface CancelAppointmentData {
//   cancelledBy: string;
//   cancellationReason: string;
// }

// export interface RescheduleAppointmentData {
//   newDate: Date;
//   reason?: string;
// }

// /**
//  * Appointment service for handling appointment-related business logic
//  */
// export class AppointmentService {
//   /**
//    * Create a new appointment
//    */
//   static async createAppointment(appointmentData: CreateAppointmentData): Promise<IAppointment> {
//     try {
//       // Validate patient exists and is a patient
//       const patient = await UserService.findUserById(appointmentData.patientId);
//       if (!patient || patient.role !== UserRole.PATIENT) {
//         throw new Error('Invalid patient ID or user is not a patient');
//       }

//       // Validate doctor exists and is a doctor
//       const doctor = await UserService.findUserById(appointmentData.doctorId);
//       if (!doctor || doctor.role !== UserRole.DOCTOR) {
//         throw new Error('Invalid doctor ID or user is not a doctor');
//       }

//       // Check if appointment date is in the future
//       if (appointmentData.appointmentDate <= new Date()) {
//         throw new Error('Appointment date must be in the future');
//       }

//       // Use transaction to prevent race conditions
//       const appointment = await DatabaseUtil.withTransaction(async (session) => {
//         // Check for doctor availability within transaction
//         const isAvailable = await this.checkDoctorAvailability(
//           appointmentData.doctorId,
//           appointmentData.appointmentDate,
//           appointmentData.duration || 30
//         );

//         if (!isAvailable) {
//           throw new Error('Doctor is not available at the requested time');
//         }

//         // Create appointment
//         const newAppointment = new Appointment({
//           patient: appointmentData.patientId,
//           doctor: appointmentData.doctorId,
//           appointmentDate: appointmentData.appointmentDate,
//           duration: appointmentData.duration || 30,
//           type: appointmentData.type || AppointmentType.CONSULTATION,
//           reason: appointmentData.reason,
//           symptoms: appointmentData.symptoms || [],
//           notes: appointmentData.notes,
//           isEmergency: appointmentData.isEmergency || false,
//           status: appointmentData.isEmergency ? AppointmentStatus.CONFIRMED : AppointmentStatus.SCHEDULED,
//         });

//         await newAppointment.save({ session });
//         return newAppointment;
//       });

//       // Populate references before returning
//       await appointment.populate([
//         { path: 'patient', select: 'name email' },
//         { path: 'doctor', select: 'name email' }
//       ]);

//       // Log appointment creation
//       logAppointment.created(
//         appointment._id.toString(),
//         appointmentData.doctorId,
//         appointmentData.patientId,
//         appointmentData.appointmentDate
//       );

//       return appointment;
//     } catch (error) {
//       if (error instanceof Error) {
//         throw new Error(`Failed to create appointment: ${error.message}`);
//       }
//       throw new Error('Failed to create appointment: Unknown error');
//     }
//   }

//   /**
//    * Find appointment by ID
//    */
//   static async findAppointmentById(appointmentId: string): Promise<IAppointment | null> {
//     try {
//       if (!DatabaseUtil.isValidObjectId(appointmentId)) {
//         throw new Error('Invalid appointment ID format');
//       }

//       return await Appointment.findById(appointmentId)
//         .populate('patient', 'name email')
//         .populate('doctor', 'name email')
//         .populate('cancelledBy', 'name email');
//     } catch (error) {
//       if (error instanceof Error) {
//         throw new Error(`Failed to find appointment: ${error.message}`);
//       }
//       throw new Error('Failed to find appointment: Unknown error');
//     }
//   }

//   /**
//    * Update appointment
//    */
//   static async updateAppointment(
//     appointmentId: string,
//     updateData: UpdateAppointmentData
//   ): Promise<IAppointment | null> {
//     try {
//       if (!DatabaseUtil.isValidObjectId(appointmentId)) {
//         throw new Error('Invalid appointment ID format');
//       }

//       const appointment = await Appointment.findById(appointmentId);
//       if (!appointment) {
//         throw new Error('Appointment not found');
//       }

//       // Check if appointment can be updated
//       if (appointment.status === AppointmentStatus.COMPLETED) {
//         throw new Error('Cannot update completed appointment');
//       }

//       if (appointment.status === AppointmentStatus.CANCELLED) {
//         throw new Error('Cannot update cancelled appointment');
//       }

//       // If updating appointment date, check availability
//       if (updateData.appointmentDate) {
//         const isAvailable = await this.checkDoctorAvailability(
//           appointment.doctor.toString(),
//           updateData.appointmentDate,
//           updateData.duration || appointment.duration,
//           appointmentId
//         );

//         if (!isAvailable) {
//           throw new Error('Doctor is not available at the requested time');
//         }
//       }

//       // Update appointment
//       Object.assign(appointment, updateData);
//       await appointment.save();

//       // Log appointment update
//       logAppointment.updated(
//         appointmentId,
//         'system', // In real implementation, pass the actual user ID
//         updateData
//       );

//       // Populate references
//       await appointment.populate([
//         { path: 'patient', select: 'name email' },
//         { path: 'doctor', select: 'name email' }
//       ]);

//       return appointment;
//     } catch (error) {
//       if (error instanceof Error) {
//         throw new Error(`Failed to update appointment: ${error.message}`);
//       }
//       throw new Error('Failed to update appointment: Unknown error');
//     }
//   }

//   /**
//    * Cancel appointment
//    */
//   static async cancelAppointment(
//     appointmentId: string,
//     cancelData: CancelAppointmentData
//   ): Promise<IAppointment | null> {
//     try {
//       if (!DatabaseUtil.isValidObjectId(appointmentId)) {
//         throw new Error('Invalid appointment ID format');
//       }

//       const appointment = await Appointment.findById(appointmentId);
//       if (!appointment) {
//         throw new Error('Appointment not found');
//       }

//       // Check if appointment can be cancelled
//       if (!appointment.canBeCancelled()) {
//         throw new Error('Appointment cannot be cancelled (too close to appointment time or invalid status)');
//       }

//       // Update appointment status
//       appointment.status = AppointmentStatus.CANCELLED;
//       appointment.cancelledBy = new mongoose.Types.ObjectId(cancelData.cancelledBy);
//       appointment.cancellationReason = cancelData.cancellationReason;

//       await appointment.save();

//       // Log cancellation
//       logAppointment.cancelled(
//         appointmentId,
//         cancelData.cancelledBy,
//         cancelData.cancellationReason
//       );

//       // Populate references
//       await appointment.populate([
//         { path: 'patient', select: 'name email' },
//         { path: 'doctor', select: 'name email' },
//         { path: 'cancelledBy', select: 'name email' }
//       ]);

//       return appointment;
//     } catch (error) {
//       if (error instanceof Error) {
//         throw new Error(`Failed to cancel appointment: ${error.message}`);
//       }
//       throw new Error('Failed to cancel appointment: Unknown error');
//     }
//   }

//   /**
//    * Reschedule appointment
//    */
//   static async rescheduleAppointment(
//     appointmentId: string,
//     rescheduleData: RescheduleAppointmentData
//   ): Promise<IAppointment | null> {
//     try {
//       if (!DatabaseUtil.isValidObjectId(appointmentId)) {
//         throw new Error('Invalid appointment ID format');
//       }

//       const appointment = await Appointment.findById(appointmentId);
//       if (!appointment) {
//         throw new Error('Appointment not found');
//       }

//       // Check if appointment can be rescheduled
//       if (!appointment.canBeRescheduled()) {
//         throw new Error('Appointment cannot be rescheduled (too close to appointment time or invalid status)');
//       }

//       // Check doctor availability for new date
//       const isAvailable = await this.checkDoctorAvailability(
//         appointment.doctor.toString(),
//         rescheduleData.newDate,
//         appointment.duration,
//         appointmentId
//       );

//       if (!isAvailable) {
//         throw new Error('Doctor is not available at the requested time');
//       }

//       // Use transaction to ensure both appointments are saved atomically
//       const newAppointment = await DatabaseUtil.withTransaction(async (session) => {
//         // Create new appointment with rescheduled data
//         const newAppt = new Appointment({
//           patient: appointment.patient,
//           doctor: appointment.doctor,
//           appointmentDate: rescheduleData.newDate,
//           duration: appointment.duration,
//           type: appointment.type,
//           reason: appointment.reason,
//           symptoms: appointment.symptoms,
//           notes: rescheduleData.reason ?
//             `${appointment.notes || ''}\n\nRescheduled: ${rescheduleData.reason}`.trim() :
//             appointment.notes,
//           isEmergency: appointment.isEmergency,
//           rescheduledFrom: appointment._id,
//         });

//         // Mark original appointment as rescheduled
//         appointment.status = AppointmentStatus.RESCHEDULED;

//         // Save both appointments within transaction
//         await appointment.save({ session });
//         await newAppt.save({ session });

//         return newAppt;
//       });

//       // Log rescheduling
//       logAppointment.rescheduled(
//         appointmentId,
//         appointment.appointmentDate,
//         rescheduleData.newDate,
//         rescheduleData.reason
//       );

//       // Populate references for new appointment
//       await newAppointment.populate([
//         { path: 'patient', select: 'name email' },
//         { path: 'doctor', select: 'name email' }
//       ]);

//       return newAppointment;
//     } catch (error) {
//       if (error instanceof Error) {
//         throw new Error(`Failed to reschedule appointment: ${error.message}`);
//       }
//       throw new Error('Failed to reschedule appointment: Unknown error');
//     }
//   }

//   /**
//    * Get appointments with filtering and pagination
//    */
//   static async getAppointments(query: AppointmentQuery = {}) {
//     try {
//       const {
//         page = 1,
//         limit = 20, // Default limit to prevent unbounded queries
//         status,
//         type,
//         patientId,
//         doctorId,
//         startDate,
//         endDate,
//         isEmergency,
//         sortBy = 'appointmentDate',
//         sortOrder = 'asc'
//       } = query;

//       // Enforce maximum limit to prevent performance issues
//       const maxLimit = 100;
//       const effectiveLimit = Math.min(limit, maxLimit);

//       // Build filter object
//       const filter: any = {};

//       if (status) filter.status = status;
//       if (type) filter.type = type;
//       if (patientId) filter.patient = patientId;
//       if (doctorId) filter.doctor = doctorId;
//       if (isEmergency !== undefined) filter.isEmergency = isEmergency;

//       if (startDate || endDate) {
//         filter.appointmentDate = {};
//         if (startDate) filter.appointmentDate.$gte = startDate;
//         if (endDate) filter.appointmentDate.$lte = endDate;
//       }

//       // Build sort object
//       const sort: any = {};
//       sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

//       // Calculate pagination
//       const skip = (page - 1) * effectiveLimit;

//       // Execute queries
//       const [appointments, total] = await Promise.all([
//         Appointment.find(filter)
//           .populate('patient', 'name email')
//           .populate('doctor', 'name email')
//           .populate('cancelledBy', 'name email')
//           .sort(sort)
//           .skip(skip)
//           .limit(effectiveLimit)
//           .lean(),
//         Appointment.countDocuments(filter)
//       ]);

//       return {
//         appointments,
//         pagination: {
//           page,
//           limit: effectiveLimit,
//           total,
//           pages: Math.ceil(total / effectiveLimit)
//         }
//       };
//     } catch (error) {
//       if (error instanceof Error) {
//         throw new Error(`Failed to get appointments: ${error.message}`);
//       }
//       throw new Error('Failed to get appointments: Unknown error');
//     }
//   }

//   /**
//    * Get upcoming appointments for a user
//    */
//   static async getUpcomingAppointments(userId: string, role: UserRole) {
//     try {
//       const filter: any = {
//         appointmentDate: { $gte: new Date() },
//         status: { $in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] }
//       };

//       if (role === UserRole.PATIENT) {
//         filter.patient = userId;
//       } else if (role === UserRole.DOCTOR) {
//         filter.doctor = userId;
//       }

//       return await Appointment.find(filter)
//         .populate('patient', 'name email')
//         .populate('doctor', 'name email')
//         .sort({ appointmentDate: 1 });
//     } catch (error) {
//       if (error instanceof Error) {
//         throw new Error(`Failed to get upcoming appointments: ${error.message}`);
//       }
//       throw new Error('Failed to get upcoming appointments: Unknown error');
//     }
//   }

//   /**
//    * Check doctor availability
//    */
//   static async checkDoctorAvailability(
//     doctorId: string,
//     appointmentDate: Date,
//     duration: number,
//     excludeAppointmentId?: string
//   ): Promise<boolean> {
//     try {
//       const startTime = appointmentDate;
//       const endTime = new Date(appointmentDate.getTime() + (duration * 60000));

//       // Find any appointments that overlap with the requested time slot
//       // An appointment overlaps if:
//       // 1. It starts before our end time AND
//       // 2. It ends after our start time
//       const filter: any = {
//         doctor: doctorId,
//         status: { $in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS] }
//       };

//       if (excludeAppointmentId) {
//         filter._id = { $ne: excludeAppointmentId };
//       }

//       // Get all active appointments for this doctor
//       const appointments = await Appointment.find(filter).select('appointmentDate duration').lean();

//       // Check for overlaps manually for better reliability
//       for (const appt of appointments) {
//         const apptStart = new Date(appt.appointmentDate);
//         const apptEnd = new Date(apptStart.getTime() + (appt.duration * 60000));

//         // Check if time slots overlap
//         if (apptStart < endTime && apptEnd > startTime) {
//           return false; // Conflict found
//         }
//       }

//       return true; // No conflicts
//     } catch (error) {
//       console.error('Error checking doctor availability:', error);
//       return false;
//     }
//   }

//   /**
//    * Get appointment statistics
//    */
//   static async getAppointmentStats(doctorId?: string) {
//     try {
//       const matchStage: any = {};
//       if (doctorId) {
//         matchStage.doctor = new mongoose.Types.ObjectId(doctorId);
//       }

//       const stats = await Appointment.aggregate([
//         { $match: matchStage },
//         {
//           $group: {
//             _id: null,
//             totalAppointments: { $sum: 1 },
//             scheduledCount: {
//               $sum: { $cond: [{ $eq: ['$status', AppointmentStatus.SCHEDULED] }, 1, 0] }
//             },
//             confirmedCount: {
//               $sum: { $cond: [{ $eq: ['$status', AppointmentStatus.CONFIRMED] }, 1, 0] }
//             },
//             completedCount: {
//               $sum: { $cond: [{ $eq: ['$status', AppointmentStatus.COMPLETED] }, 1, 0] }
//             },
//             cancelledCount: {
//               $sum: { $cond: [{ $eq: ['$status', AppointmentStatus.CANCELLED] }, 1, 0] }
//             },
//             missedCount: {
//               $sum: { $cond: [{ $eq: ['$status', AppointmentStatus.MISSED] }, 1, 0] }
//             },
//             emergencyCount: {
//               $sum: { $cond: ['$isEmergency', 1, 0] }
//             },
//             averageDuration: { $avg: '$duration' },
//             totalRevenue: { $sum: '$amount' }
//           }
//         }
//       ]);

//       return stats[0] || {
//         totalAppointments: 0,
//         scheduledCount: 0,
//         confirmedCount: 0,
//         completedCount: 0,
//         cancelledCount: 0,
//         missedCount: 0,
//         emergencyCount: 0,
//         averageDuration: 0,
//         totalRevenue: 0
//       };
//     } catch (error) {
//       if (error instanceof Error) {
//         throw new Error(`Failed to get appointment stats: ${error.message}`);
//       }
//       throw new Error('Failed to get appointment stats: Unknown error');
//     }
//   }

//   /**
//    * Complete appointment
//    */
//   static async completeAppointment(
//     appointmentId: string,
//     completionData: {
//       doctorNotes?: string;
//       prescription?: string;
//       diagnosis?: string;
//       followUpRequired?: boolean;
//       followUpDate?: Date;
//     }
//   ): Promise<IAppointment | null> {
//     try {
//       const appointment = await Appointment.findById(appointmentId);
//       if (!appointment) {
//         throw new Error('Appointment not found');
//       }

//       if (appointment.status !== AppointmentStatus.IN_PROGRESS &&
//           appointment.status !== AppointmentStatus.CONFIRMED) {
//         throw new Error('Only confirmed or in-progress appointments can be completed');
//       }

//       // Update appointment with completion data
//       appointment.status = AppointmentStatus.COMPLETED;
//       appointment.doctorNotes = completionData.doctorNotes;
//       appointment.prescription = completionData.prescription;
//       appointment.diagnosis = completionData.diagnosis;
//       appointment.followUpRequired = completionData.followUpRequired || false;
//       appointment.followUpDate = completionData.followUpDate;

//       await appointment.save();

//       // Log completion
//       logAppointment.completed(
//         appointmentId,
//         appointment.doctor.toString(),
//         appointment.duration
//       );

//       // Populate references
//       await appointment.populate([
//         { path: 'patient', select: 'name email' },
//         { path: 'doctor', select: 'name email' }
//       ]);

//       return appointment;
//     } catch (error) {
//       if (error instanceof Error) {
//         throw new Error(`Failed to complete appointment: ${error.message}`);
//       }
//       throw new Error('Failed to complete appointment: Unknown error');
//     }
//   }
// }
