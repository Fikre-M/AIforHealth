import { AppointmentStatus } from "@/types";
import type {
  Patient,
  DoctorAppointment,
  AppointmentRequest,
  PatientSummary,
  AppointmentStatus,
} from "@/types/doctor";
import api from "./api";

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface PaginatedResponse<T>
  extends ApiResponse<{ items: T[]; total: number }> {}

export const doctorService = {
  /**
   * Get today's appointments
   */
  async getTodayAppointments(): Promise<DoctorAppointment[]> {
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await api.get<PaginatedResponse<DoctorAppointment>>(
        "/doctor/appointments/daily",
        { params: { date: today } }
      );
      return response.data.data.items;
    } catch (error) {
      console.error("Failed to fetch today's appointments:", error);
      throw error;
    }
  },

  async updateAppointmentStatus(
  appointmentId: string, 
  status: AppointmentStatus
): Promise<DoctorAppointment> {
  try {
    const response = await api.patch<ApiResponse<{ appointment: DoctorAppointment }>>(
      `/doctor/appointments/${appointmentId}/status`,
      { status }
    );
    return response.data.data.appointment;
  } catch (error) {
    console.error('Failed to update appointment status:', error);
    throw error;
  }
}

  /**
   * Get all patients
   */
  async getPatients(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ patients: Patient[]; total: number }> {
    try {
      const response = await api.get<PaginatedResponse<Patient>>(
        "/doctor/patients",
        {
          params,
        }
      );
      return {
        patients: response.data.data.items,
        total: response.data.data.total,
      };
    } catch (error) {
      console.error("Failed to fetch patients:", error);
      throw error;
    }
  },

  /**
   * Get a single patient by ID
   */
  async getPatient(patientId: string): Promise<Patient | null> {
    try {
      const response = await api.get<ApiResponse<{ patient: Patient }>>(
        `/doctor/patients/${patientId}`
      );
      return response.data.data.patient;
    } catch (error) {
      if ((error as any)?.response?.status === 404) {
        return null;
      }
      console.error(`Failed to fetch patient ${patientId}:`, error);
      throw error;
    }
  },

  /**
   * Get appointment requests
   */
  async getAppointmentRequests(params?: {
    status?: "pending" | "approved" | "rejected";
    page?: number;
    limit?: number;
  }): Promise<{ requests: AppointmentRequest[]; total: number }> {
    try {
      const response = await api.get<PaginatedResponse<AppointmentRequest>>(
        "/appointment-requests",
        { params }
      );
      return {
        requests: response.data.data.items,
        total: response.data.data.total,
      };
    } catch (error) {
      console.error("Failed to fetch appointment requests:", error);
      throw error;
    }
  },

  /**
   * Get patient summaries
   */
  async getPatientSummaries(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ summaries: PatientSummary[]; total: number }> {
    try {
      const response = await api.get<PaginatedResponse<PatientSummary>>(
        "/doctor/patients/summaries",
        { params }
      );
      return {
        summaries: response.data.data.items,
        total: response.data.data.total,
      };
    } catch (error) {
      console.error("Failed to fetch patient summaries:", error);
      throw error;
    }
  },

  /**
   * Update appointment status
   */
  async updateAppointmentStatus(
    appointmentId: string,
    status: AppointmentStatus
  ): Promise<DoctorAppointment> {
    try {
      const response = await api.patch<
        ApiResponse<{ appointment: DoctorAppointment }>
      >(`/doctor/appointments/${appointmentId}/status`, { status });
      return response.data.data.appointment;
    } catch (error) {
      console.error("Failed to update appointment status:", error);
      throw error;
    }
  },

  /**
   * Approve an appointment request
   */
  async approveAppointmentRequest(
    requestId: string,
    data: { date: string; time: string; notes?: string }
  ): Promise<AppointmentRequest> {
    try {
      const response = await api.post<
        ApiResponse<{ request: AppointmentRequest }>
      >(`/appointment-requests/${requestId}/approve`, data);
      return response.data.data.request;
    } catch (error) {
      console.error("Failed to approve appointment request:", error);
      throw error;
    }
  },

  /**
   * Reject an appointment request
   */
  async rejectAppointmentRequest(
    requestId: string,
    reason: string
  ): Promise<AppointmentRequest> {
    try {
      const response = await api.post<
        ApiResponse<{ request: AppointmentRequest }>
      >(`/appointment-requests/${requestId}/reject`, { reason });
      return response.data.data.request;
    } catch (error) {
      console.error("Failed to reject appointment request:", error);
      throw error;
    }
  },
};
