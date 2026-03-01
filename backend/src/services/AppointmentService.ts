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

export interface BulkOperationItem {
  id: string;
  reason?: string;
  data?: Record<string, unknown>;
}

/* =========================================================
   Service
========================================================= */

export class AppointmentService {
  /* ================= CREATE ================= */

  static async createAppointment(
    data: CreateAppointmentData
  ): Promise<typeof Appointment.prototype> {
    const conflict = await Appointment.findOne({
      doctor: data.doctorId,
      appointmentDate: data.appointmentDate,
      status: { $ne: 'cancelled' },
    });

    if (conflict) {
      throw new AppError('Time slot already booked', 409);
    }

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
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid appointment ID', 400);
    }

    return Appointment.findById(id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email specialization');
  }

  /* ================= PAGINATED GET ================= */

  static async getAppointments(filters: PaginationOptions): Promise<PaginatedResult<unknown>> {
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (filters.status) query.status = filters.status;

    if (filters.startDate || filters.endDate) {
      query.appointmentDate = {};
      if (filters.startDate) {
        (query.appointmentDate as Record<string, unknown>).$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        (query.appointmentDate as Record<string, unknown>).$lte = new Date(filters.endDate);
      }
    }

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

  static async updateAppointment(id: string, data: Record<string, unknown>) {
    return Appointment.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  /* ================= STATUS ================= */

  static async updateAppointmentStatus(id: string, status: string) {
    return Appointment.findByIdAndUpdate(id, { status }, { new: true, runValidators: true })
      .populate('patient', 'name email')
      .populate('doctor', 'name email');
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
    );
  }

  /* ================= RESCHEDULE ================= */

  static async rescheduleAppointment(id: string, newDate: Date, reason?: string) {
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    const available = await this.checkAvailability(appointment.doctor.toString(), newDate);

    if (!available) {
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
    );
  }

  /* ================= DOCTOR APPOINTMENTS ================= */

  static async getDoctorAppointments(
    doctorId: string,
    options: PaginationOptions
  ): Promise<PaginatedResult<unknown>> {
    return this.getAppointments({
      ...options,
      startDate: options.startDate,
      endDate: options.endDate,
      status: options.status,
      page: options.page,
      limit: options.limit,
    });
  }

  /* ================= PATIENT APPOINTMENTS ================= */

  static async getPatientAppointments(
    patientId: string,
    options: PaginationOptions
  ): Promise<PaginatedResult<unknown>> {
    const page = options.page ?? 1;
    const limit = Math.min(options.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { patient: patientId };
    if (options.status) query.status = options.status;

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .skip(skip)
        .limit(limit)
        .populate('doctor', 'name email specialization')
        .sort({ appointmentDate: -1 })
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

  /* ================= BACKWARD COMPATIBILITY ================= */

  // Alias to prevent test/controller failures
  static async getUpcomingAppointments(patientId: string, options: PaginationOptions) {
    return this.getPatientAppointments(patientId, options);
  }

  /* ================= AVAILABILITY ================= */

  static async checkAvailability(doctorId: string, appointmentDate: Date): Promise<boolean> {
    const conflict = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate,
      status: { $in: ['scheduled', 'confirmed', 'in_progress'] },
    });

    return !conflict;
  }

  /* ================= BULK ================= */

  static async bulkUpdateAppointments(operation: string, appointments: BulkOperationItem[]) {
    const result = {
      successful: [] as unknown[],
      failed: [] as { id: string; reason: string }[],
    };

    for (const item of appointments) {
      try {
        let updated;

        if (operation === 'cancel') {
          updated = await this.cancelAppointment(item.id, item.reason);
        } else if (operation === 'complete') {
          updated = await this.completeAppointment(
            item.id,
            item.data as {
              notes?: string;
              diagnosis?: string;
              prescription?: string;
            }
          );
        } else {
          throw new AppError('Unsupported operation', 400);
        }

        if (updated) result.successful.push(updated);
        else result.failed.push({ id: item.id, reason: 'Not found' });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        result.failed.push({ id: item.id, reason: message });
      }
    }

    return result;
  }
}
