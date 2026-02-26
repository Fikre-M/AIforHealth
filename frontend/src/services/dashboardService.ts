import type {
  Appointment,
  Medication,
  HealthReminder,
  HealthMetric,
} from "@/types/dashboard";
import api from "./api";
import { logError, logInfo, logDebug } from "@/utils/logger";

interface ApiResponse<T> {
  data: T;
  message?: string;
}

export const dashboardService = {
  /**
   * Get upcoming appointments
   */
  async getUpcomingAppointments(): Promise<Appointment[]> {
    try {
      logDebug('Fetching upcoming appointments');
      const response = await api.get<
        ApiResponse<{ appointments: Appointment[] }>
      >("/appointments", { 
        params: { 
          status: 'scheduled,confirmed',
          startDate: new Date().toISOString().split('T')[0]
        } 
      });
      logInfo('Successfully fetched upcoming appointments', { count: response.data.data.appointments.length });
      return response.data.data.appointments;
    } catch (error) {
      logError("Failed to fetch upcoming appointments", error as Error);
      throw error;
    }
  },

  /**
   * Get appointment history
   */
  async getAppointmentHistory(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<Appointment[]> {
    try {
      const response = await api.get<
        ApiResponse<{
          appointments: Appointment[];
          pagination: { total: number };
        }>
      >("/appointments", { 
        params: {
          ...params,
          status: params?.status || 'completed,cancelled,missed'
        }
      });

      logInfo('Successfully fetched appointment history', { 
        count: response.data.data.appointments.length,
        total: response.data.data.pagination.total 
      });
      return response.data.data.appointments;
    } catch (error) {
      logError("Failed to fetch appointment history", error as Error);
      throw error;
    }
  },

  /**
   * Get medications
   */
  async getMedications(): Promise<Medication[]> {
    try {
      const response = await api.get<
        ApiResponse<{ medications: Medication[] }>
      >("/health/medications");
      logInfo('Successfully fetched medications', { count: response.data.data.medications.length });
      return response.data.data.medications;
    } catch (error) {
      logError("Failed to fetch medications", error as Error);
      throw error;
    }
  },

  /**
   * Get health reminders
   */
  async getHealthReminders(params?: {
    completed?: boolean;
    priority?: "low" | "medium" | "high";
  }): Promise<HealthReminder[]> {
    try {
      const response = await api.get<
        ApiResponse<{ reminders: HealthReminder[] }>
      >("/health/reminders", { params });
      logInfo('Successfully fetched health reminders', { count: response.data.data.reminders.length });
      return response.data.data.reminders;
    } catch (error) {
      logError("Failed to fetch health reminders", error as Error);
      throw error;
    }
  },

  /**
   * Get health metrics
   */
  async getHealthMetrics(params?: {
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<HealthMetric[]> {
    try {
      const response = await api.get<ApiResponse<{ metrics: HealthMetric[] }>>(
        "/health/metrics",
        { params }
      );
      logInfo('Successfully fetched health metrics', { count: response.data.data.metrics.length });
      return response.data.data.metrics;
    } catch (error) {
      logError("Failed to fetch health metrics", error as Error);
      throw error;
    }
  },

  /**
   * Mark a reminder as complete
   */
  async markReminderComplete(reminderId: string): Promise<void> {
    try {
      logDebug('Marking reminder as complete', { reminderId });
      await api.patch(`/health/reminders/${reminderId}/complete`);
      logInfo('Successfully marked reminder as complete', { reminderId });
    } catch (error) {
      logError("Failed to mark reminder as complete", error as Error, { reminderId });
      throw error;
    }
  },

  /**
   * Reschedule an appointment
   */
  async rescheduleAppointment(
    appointmentId: string,
    newDate: string,
    newTime: string
  ): Promise<Appointment> {
    try {
      logDebug('Rescheduling appointment', { appointmentId, newDate, newTime });
      const response = await api.post<
        ApiResponse<{ appointment: Appointment }>
      >(`/appointments/${appointmentId}/reschedule`, { 
        newDate: `${newDate}T${newTime}:00.000Z`
      });
      logInfo('Successfully rescheduled appointment', { appointmentId });
      return response.data.data.appointment;
    } catch (error) {
      logError("Failed to reschedule appointment", error as Error, { appointmentId });
      throw error;
    }
  },
};