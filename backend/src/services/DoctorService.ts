import { User, IUser, Appointment, IAppointment, AppointmentStatus } from '@/models';
import { UserRole } from '@/types';
import { DatabaseUtil } from '@/utils/database';
import mongoose from 'mongoose';

export interface DoctorPatientQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreatePatientData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory?: string[];
  allergies?: string[];
  currentMedications?: string[];
}

export interface UpdatePatientData {
  name?: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory?: string[];
  allergies?: string[];
  currentMedications?: string[];
}

/**
 * Doctor service for handling doctor-specific business logic
 */
export class DoctorService {
  /**
   * Get doctor's daily appointments
   */
  static async getDailyAppointments(doctorId: string): Promise<IAppointment[]> {
    try {
      if (!DatabaseUtil.isValidObjectId(doctorId)) {
        throw new Error('Invalid doctor ID format');
      }

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const appointments = await Appointment.find({
        doctor: doctorId,
        appointmentDate: {
          $gte: startOfDay,
          $lte: endOfDay
        },
        status: { $in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS] }
      })
        .populate('patient', 'name email phone dateOfBirth gender')
        .sort({ appointmentDate: 1 });

      return appointments;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get daily appointments: ${error.message}`);
      }
      throw new Error('Failed to get daily appointments: Unknown error');
    }
  }

  /**
   * Get doctor's upcoming appointments with pagination
   */
  static async getUpcomingAppointments(
    doctorId: string,
    query: { page?: number; limit?: number } = {}
  ) {
    try {
      if (!DatabaseUtil.isValidObjectId(doctorId)) {
        throw new Error('Invalid doctor ID format');
      }

      const { page = 1, limit = 20 } = query;
      
      // Enforce maximum limit
      const maxLimit = 100;
      const effectiveLimit = Math.min(limit, maxLimit);
      const skip = (page - 1) * effectiveLimit;

      const now = new Date();

      const [appointments, total] = await Promise.all([
        Appointment.find({
          doctor: doctorId,
          appointmentDate: { $gte: now },
          status: { $in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] }
        })
          .populate('patient', 'name email phone dateOfBirth gender')
          .sort({ appointmentDate: 1 })
          .skip(skip)
          .limit(effectiveLimit)
          .lean(),
        Appointment.countDocuments({
          doctor: doctorId,
          appointmentDate: { $gte: now },
          status: { $in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] }
        })
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
        throw new Error(`Failed to get upcoming appointments: ${error.message}`);
      }
      throw new Error('Failed to get upcoming appointments: Unknown error');
    }
  }

  /**
   * Get doctor's patients list
   */
  static async getPatientsList(doctorId: string, query: DoctorPatientQuery = {}) {
    try {
      if (!DatabaseUtil.isValidObjectId(doctorId)) {
        throw new Error('Invalid doctor ID format');
      }

      const {
        page = 1,
        limit = 20, // Default limit
        search,
        sortBy = 'name',
        sortOrder = 'asc'
      } = query;

      // Enforce maximum limit
      const maxLimit = 100;
      const effectiveLimit = Math.min(limit, maxLimit);

      // Find all unique patient IDs from appointments with this doctor
      const patientIds = await Appointment.distinct('patient', { doctor: doctorId });

      // Build filter for patients
      const filter: any = {
        _id: { $in: patientIds },
        role: UserRole.PATIENT,
        isActive: true
      };

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ];
      }

      // Build sort object
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const skip = (page - 1) * effectiveLimit;

      const [patients, total] = await Promise.all([
        User.find(filter)
          .select('name email phone dateOfBirth gender address emergencyContact medicalHistory allergies currentMedications createdAt')
          .sort(sort)
          .skip(skip)
          .limit(effectiveLimit)
          .lean(),
        User.countDocuments(filter)
      ]);

      // Calculate age for each patient
      const patientsWithAge = patients.map(patient => {
        let age = null;
        if (patient.dateOfBirth) {
          const today = new Date();
          const birthDate = new Date(patient.dateOfBirth);
          age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
        }
        return { ...patient, age };
      });

      return {
        patients: patientsWithAge,
        pagination: {
          page,
          limit: effectiveLimit,
          total,
          pages: Math.ceil(total / effectiveLimit)
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get patients list: ${error.message}`);
      }
      throw new Error('Failed to get patients list: Unknown error');
    }
  }

  /**
   * Get patient details by ID (only if doctor has treated them)
   */
  static async getPatientDetails(doctorId: string, patientId: string): Promise<IUser | null> {
    try {
      if (!DatabaseUtil.isValidObjectId(doctorId) || !DatabaseUtil.isValidObjectId(patientId)) {
        throw new Error('Invalid ID format');
      }

      // Check if doctor has any appointments with this patient
      const hasAppointment = await Appointment.exists({
        doctor: doctorId,
        patient: patientId
      });

      if (!hasAppointment) {
        throw new Error('Access denied: No appointment history with this patient');
      }

      const patient = await User.findOne({
        _id: patientId,
        role: UserRole.PATIENT,
        isActive: true
      }).select('-password -passwordResetToken -emailVerificationToken');

      return patient;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get patient details: ${error.message}`);
      }
      throw new Error('Failed to get patient details: Unknown error');
    }
  }

  /**
   * Create a new patient (doctor-created patient)
   */
  static async createPatient(doctorId: string, patientData: CreatePatientData): Promise<IUser> {
    try {
      if (!DatabaseUtil.isValidObjectId(doctorId)) {
        throw new Error('Invalid doctor ID format');
      }

      // Check if email already exists
      const existingUser = await User.findOne({ email: patientData.email.toLowerCase() });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create patient
      const patient = new User({
        ...patientData,
        role: UserRole.PATIENT,
        createdBy: doctorId,
        isEmailVerified: false
      });

      await patient.save();

      return patient;
    } catch (error: any) {
      if (error.code === 11000 && error.keyPattern?.email) {
        throw new Error('User with this email already exists');
      }
      if (error instanceof Error) {
        throw new Error(`Failed to create patient: ${error.message}`);
      }
      throw new Error('Failed to create patient: Unknown error');
    }
  }

  /**
   * Update patient information (only if doctor has treated them)
   */
  static async updatePatient(
    doctorId: string,
    patientId: string,
    updateData: UpdatePatientData
  ): Promise<IUser | null> {
    try {
      if (!DatabaseUtil.isValidObjectId(doctorId) || !DatabaseUtil.isValidObjectId(patientId)) {
        throw new Error('Invalid ID format');
      }

      // Check if doctor has any appointments with this patient
      const hasAppointment = await Appointment.exists({
        doctor: doctorId,
        patient: patientId
      });

      if (!hasAppointment) {
        throw new Error('Access denied: No appointment history with this patient');
      }

      const patient = await User.findOneAndUpdate(
        { _id: patientId, role: UserRole.PATIENT },
        updateData,
        { new: true, runValidators: true }
      ).select('-password -passwordResetToken -emailVerificationToken');

      return patient;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update patient: ${error.message}`);
      }
      throw new Error('Failed to update patient: Unknown error');
    }
  }

  /**
   * Get patient summaries (brief info for quick reference)
   */
  static async getPatientSummaries(doctorId: string) {
    try {
      if (!DatabaseUtil.isValidObjectId(doctorId)) {
        throw new Error('Invalid doctor ID format');
      }

      // Get unique patient IDs from appointments
      const patientIds = await Appointment.distinct('patient', { doctor: doctorId });

      const patients = await User.find({
        _id: { $in: patientIds },
        role: UserRole.PATIENT,
        isActive: true
      })
        .select('name email phone dateOfBirth gender')
        .lean();

      // Optimize: Fetch all appointments in bulk instead of per-patient queries
      const [lastAppointments, upcomingAppointments] = await Promise.all([
        // Get last completed appointment for each patient
        Appointment.aggregate([
          {
            $match: {
              doctor: new mongoose.Types.ObjectId(doctorId),
              patient: { $in: patientIds.map(id => new mongoose.Types.ObjectId(id)) },
              status: AppointmentStatus.COMPLETED
            }
          },
          { $sort: { appointmentDate: -1 } },
          {
            $group: {
              _id: '$patient',
              appointmentDate: { $first: '$appointmentDate' },
              diagnosis: { $first: '$diagnosis' }
            }
          }
        ]),
        // Get upcoming appointment for each patient
        Appointment.aggregate([
          {
            $match: {
              doctor: new mongoose.Types.ObjectId(doctorId),
              patient: { $in: patientIds.map(id => new mongoose.Types.ObjectId(id)) },
              appointmentDate: { $gte: new Date() },
              status: { $in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] }
            }
          },
          { $sort: { appointmentDate: 1 } },
          {
            $group: {
              _id: '$patient',
              appointmentDate: { $first: '$appointmentDate' },
              type: { $first: '$type' }
            }
          }
        ])
      ]);

      // Create lookup maps for O(1) access
      const lastApptMap = new Map(
        lastAppointments.map(appt => [appt._id.toString(), appt])
      );
      const upcomingApptMap = new Map(
        upcomingAppointments.map(appt => [appt._id.toString(), appt])
      );

      // Build summaries without additional queries
      const summaries = patients.map(patient => {
        const patientIdStr = patient._id.toString();
        const lastAppt = lastApptMap.get(patientIdStr);
        const upcomingAppt = upcomingApptMap.get(patientIdStr);

        let age = null;
        if (patient.dateOfBirth) {
          const today = new Date();
          const birthDate = new Date(patient.dateOfBirth);
          age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
        }

        return {
          id: patient._id,
          name: patient.name,
          email: patient.email,
          phone: patient.phone,
          age,
          gender: patient.gender,
          lastVisit: lastAppt?.appointmentDate || null,
          lastDiagnosis: lastAppt?.diagnosis || null,
          upcomingAppointment: upcomingAppt?.appointmentDate || null
        };
      });

      return summaries;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get patient summaries: ${error.message}`);
      }
      throw new Error('Failed to get patient summaries: Unknown error');
    }
  }

  /**
   * Get doctor's appointment statistics
   */
  static async getDoctorStats(doctorId: string) {
    try {
      if (!DatabaseUtil.isValidObjectId(doctorId)) {
        throw new Error('Invalid doctor ID format');
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - today.getDay());

      const thisWeekEnd = new Date(thisWeekStart);
      thisWeekEnd.setDate(thisWeekStart.getDate() + 7);

      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const [
        todayAppointments,
        weekAppointments,
        monthAppointments,
        totalPatients,
        completedAppointments,
        cancelledAppointments
      ] = await Promise.all([
        Appointment.countDocuments({
          doctor: doctorId,
          appointmentDate: { $gte: today, $lt: tomorrow },
          status: { $in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS] }
        }),
        Appointment.countDocuments({
          doctor: doctorId,
          appointmentDate: { $gte: thisWeekStart, $lt: thisWeekEnd },
          status: { $in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS] }
        }),
        Appointment.countDocuments({
          doctor: doctorId,
          appointmentDate: { $gte: thisMonthStart, $lte: thisMonthEnd },
          status: { $in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS] }
        }),
        Appointment.distinct('patient', { doctor: doctorId }).then(ids => ids.length),
        Appointment.countDocuments({
          doctor: doctorId,
          status: AppointmentStatus.COMPLETED
        }),
        Appointment.countDocuments({
          doctor: doctorId,
          status: AppointmentStatus.CANCELLED
        })
      ]);

      return {
        todayAppointments,
        weekAppointments,
        monthAppointments,
        totalPatients,
        completedAppointments,
        cancelledAppointments,
        totalAppointments: completedAppointments + cancelledAppointments + todayAppointments
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get doctor stats: ${error.message}`);
      }
      throw new Error('Failed to get doctor stats: Unknown error');
    }
  }
}
