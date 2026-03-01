import Appointment from '@/models/Appointment';
import { AppError } from '@/middleware/errorHandler';
import { Types } from 'mongoose';

/* =========================================================
   Interfaces
========================================================= */

export interface PaginationOptions {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  date?: string;
}

export interface PaginatedResult<T> {
  appointments: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateAppointmentData {
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  duration: number;
  type: string;
  reason: string;
  notes?: string;
  isEmergency?: boolean;
}

export interface UpdateAppointmentData {
  appointmentDate?: Date;
  duration?: number;
  type?: string;
  reason?: string;
  notes?: string;
  isEmergency?: boolean;
  status?: string;
  cancellationReason?: string;
  rescheduleReason?: string;
  completedAt?: Date;
  diagnosis?: string;
  prescription?: string;
}

export interface BulkOperationItem {
  id: string;
  reason?: string;
  data?: Partial<UpdateAppointmentData>;
}

/* =========================================================
   Helper Functions
========================================================= */

function buildAppointmentQuery(filters: PaginationOptions, extra: Record<string, unknown> = {}) {
  const query: Record<string, unknown> = { ...extra };
  if (filters.status) query.status = filters.status;

  if (filters.startDate || filters.endDate) {
    query.appointmentDate = {} as Record<string, unknown>;
    if (filters.startDate) (query.appointmentDate as any).$gte = new Date(filters.startDate);
    if (filters.endDate) (query.appointmentDate as any).$lte = new Date(filters.endDate);
  }

  return query;
}

/* =========================================================
   Service
========================================================= */

export class AppointmentService {
  /* ================= CREATE ================= */

  static async createAppointment(data: CreateAppointmentData) {
    const conflict = await Appointment.findOne({
      doctor: data.doctorId,
      appointmentDate: data.appointmentDate,
      status: { $ne: 'cancelled' },
    });

    if (conflict) throw new AppError('Time slot already booked', 409);

    return Appointment.create({
      patient: data.patientId,
      doctor: data.doctorId,
      appointmentDate: data.appointmentDate,
      duration: data.duration,
      type: data.type,
      reason: data.reason,
      notes: data.notes,
      isEmergency: data.isEmergency,
    });
  }

  /* ================= GET BY ID ================= */

  static async getAppointmentById(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new AppError('Invalid appointment ID', 400);

    return Appointment.findById(id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email specialization')
      .lean();
  }

  /* ================= PAGINATED GET ================= */

  static async getAppointments(
    filters: PaginationOptions,
    extraQuery: Record<string, unknown> = {}
  ): Promise<PaginatedResult<typeof Appointment.prototype>> {
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const query = buildAppointmentQuery(filters, extraQuery);

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .skip(skip)
        .limit(limit)
        .populate('patient', 'name email')
        .populate('doctor', 'name email')
        .sort({ appointmentDate: 1 })
        .lean(),
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

  /* ================= UPDATE ================= */

  static async updateAppointment(id: string, data: UpdateAppointmentData) {
    return Appointment.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();
  }

  /* ================= STATUS ================= */

  static async updateAppointmentStatus(id: string, status: string) {
    return Appointment.findByIdAndUpdate(id, { status }, { new: true, runValidators: true })
      .populate('patient', 'name email')
      .populate('doctor', 'name email')
      .lean();
  }

  /* ================= CANCEL ================= */

  static async cancelAppointment(id: string, reason?: string) {
    return Appointment.findByIdAndUpdate(
      id,
      {
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt: new Date(),
      },
      { new: true }
    ).lean();
  }

  /* ================= RESCHEDULE ================= */

  static async rescheduleAppointment(id: string, newDate: Date, reason?: string) {
    const appointment = await Appointment.findById(id);
    if (!appointment) throw new AppError('Appointment not found', 404);

    const available = await this.checkAvailability(appointment.doctor.toString(), newDate, id);
    if (!available) throw new AppError('New time slot is not available', 409);

    return Appointment.findByIdAndUpdate(
      id,
      {
        appointmentDate: newDate,
        status: 'rescheduled',
        rescheduleReason: reason,
        rescheduledAt: new Date(),
      },
      { new: true }
    ).lean();
  }

  /* ================= COMPLETE ================= */

  static async completeAppointment(
    id: string,
    data: {
      notes?: string;
      diagnosis?: string;
      prescription?: string;
    }
  ) {
    return Appointment.findByIdAndUpdate(
      id,
      {
        status: 'completed',
        completedAt: new Date(),
        ...data,
      },
      { new: true }
    ).lean();
  }

  /* ================= DOCTOR APPOINTMENTS ================= */

  static async getDoctorAppointments(
    doctorId: string,
    options: PaginationOptions
  ): Promise<PaginatedResult<typeof Appointment.prototype>> {
    return this.getAppointments(options, { doctor: doctorId });
  }

  /* ================= PATIENT APPOINTMENTS ================= */

  static async getPatientAppointments(
    patientId: string,
    options: PaginationOptions
  ): Promise<PaginatedResult<typeof Appointment.prototype>> {
    return this.getAppointments(options, { patient: patientId });
  }

  /* ================= BACKWARD COMPATIBILITY ================= */

  static async getUpcomingAppointments(patientId: string, options: PaginationOptions) {
    return this.getPatientAppointments(patientId, options);
  }

  /* ================= AVAILABILITY ================= */

  static async checkAvailability(
    doctorId: string,
    appointmentDate: Date,
    excludeId?: string
  ): Promise<boolean> {
    const conflict = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate,
      status: { $in: ['scheduled', 'confirmed', 'in_progress'] },
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    });
    return !conflict;
  }

  /* ================= BULK ================= */

  static async bulkUpdateAppointments(
    operation: 'cancel' | 'complete',
    appointments: BulkOperationItem[]
  ) {
    const result = {
      successful: [] as unknown[],
      failed: [] as { id: string; reason: string }[],
    };

    const promises = appointments.map(async (item) => {
      try {
        let updated;
        if (operation === 'cancel') updated = await this.cancelAppointment(item.id, item.reason);
        else if (operation === 'complete')
          updated = await this.completeAppointment(item.id, item.data || {});
        else throw new AppError('Unsupported operation', 400);

        if (updated) result.successful.push(updated);
        else result.failed.push({ id: item.id, reason: 'Not found' });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        result.failed.push({ id: item.id, reason: message });
      }
    });

    await Promise.all(promises);
    return result;
  }

  /* ================= STATISTICS ================= */

  static async getAppointmentStatistics(filters: {
    startDate?: string;
    endDate?: string;
    doctorId?: string;
  }) {
    const query: Record<string, unknown> = {};
    
    if (filters.doctorId) {
      query.doctor = filters.doctorId;
    }

    if (filters.startDate || filters.endDate) {
      query.appointmentDate = {} as Record<string, unknown>;
      if (filters.startDate) (query.appointmentDate as any).$gte = new Date(filters.startDate);
      if (filters.endDate) (query.appointmentDate as any).$lte = new Date(filters.endDate);
    }

    const [total, completed, cancelled, scheduled] = await Promise.all([
      Appointment.countDocuments(query),
      Appointment.countDocuments({ ...query, status: 'completed' }),
      Appointment.countDocuments({ ...query, status: 'cancelled' }),
      Appointment.countDocuments({ ...query, status: 'scheduled' }),
    ]);

    return {
      total,
      completed,
      cancelled,
      scheduled,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      cancellationRate: total > 0 ? (cancelled / total) * 100 : 0,
    };
  }

  /* ================= EXPORT ================= */

  static async exportAppointments(options: {
    format?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const query: Record<string, unknown> = {};
    
    if (options.startDate || options.endDate) {
      query.appointmentDate = {} as Record<string, unknown>;
      if (options.startDate) (query.appointmentDate as any).$gte = new Date(options.startDate);
      if (options.endDate) (query.appointmentDate as any).$lte = new Date(options.endDate);
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email specialization')
      .sort({ appointmentDate: 1 })
      .lean();

    if (options.format === 'csv') {
      const headers = ['Date', 'Time', 'Patient', 'Doctor', 'Status', 'Reason'];
      const rows = appointments.map(apt => [
        apt.appointmentDate.toISOString().split('T')[0],
        apt.appointmentDate.toISOString().split('T')[1].split('.')[0],
        (apt.patient as any)?.name || 'Unknown',
        (apt.doctor as any)?.name || 'Unknown',
        apt.status,
        apt.reason
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    return appointments;
  }

  /* ================= DOCTOR AVAILABILITY CHECK ================= */

  static async checkDoctorAvailability(
    doctorId: string,
    date: string,
    startTime?: string,
    endTime?: string
  ): Promise<boolean> {
    const appointmentDate = new Date(date);
    
    // If specific time range provided, check that slot
    if (startTime && endTime) {
      const startDateTime = new Date(`${date}T${startTime}`);
      const endDateTime = new Date(`${date}T${endTime}`);
      
      const conflict = await Appointment.findOne({
        doctor: doctorId,
        appointmentDate: {
          $gte: startDateTime,
          $lt: endDateTime
        },
        status: { $in: ['scheduled', 'confirmed', 'in_progress'] }
      });
      
      return !conflict;
    }
    
    // Otherwise check general availability for the date
    return this.checkAvailability(doctorId, appointmentDate);
  }
}
