import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import mongoose from 'mongoose';
import { AppointmentService } from '@/services/AppointmentService';
import { UserService } from '@/services/UserService';
import { User, Appointment } from '@/models';
import { UserRole } from '@/types';
import { AppointmentStatus } from '@/models/Appointment';

describe('Appointment Service - Data Integrity Tests', () => {
  let patientId: string;
  let doctorId: string;

  beforeEach(async () => {
    // Create test patient
    const patient = await UserService.createUser({
      name: 'Test Patient',
      email: 'patient@test.com',
      password: 'Password123!',
      role: UserRole.PATIENT
    });
    patientId = patient._id.toString();

    // Create test doctor
    const doctor = await UserService.createUser({
      name: 'Test Doctor',
      email: 'doctor@test.com',
      password: 'Password123!',
      role: UserRole.DOCTOR
    });
    doctorId = doctor._id.toString();
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Appointment.deleteMany({});
  });

  describe('Transaction Handling', () => {
    it('should rollback reschedule if new appointment save fails', async () => {
      // Create initial appointment
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const appointment = await AppointmentService.createAppointment({
        patientId,
        doctorId,
        appointmentDate: tomorrow,
        duration: 30,
        reason: 'Initial checkup'
      });

      // Try to reschedule to a past date (should fail)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      await expect(
        AppointmentService.rescheduleAppointment(appointment._id.toString(), {
          newDate: yesterday,
          reason: 'Reschedule test'
        })
      ).rejects.toThrow();

      // Original appointment should still be in original state
      const originalAppt = await Appointment.findById(appointment._id);
      expect(originalAppt?.status).toBe(AppointmentStatus.SCHEDULED);
    });
  });

  describe('Conflict Detection', () => {
    it('should prevent overlapping appointments', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      // Create first appointment (10:00 - 10:30)
      await AppointmentService.createAppointment({
        patientId,
        doctorId,
        appointmentDate: tomorrow,
        duration: 30,
        reason: 'First appointment'
      });

      // Try to create overlapping appointment (10:15 - 10:45)
      const overlappingTime = new Date(tomorrow);
      overlappingTime.setMinutes(15);

      await expect(
        AppointmentService.createAppointment({
          patientId,
          doctorId,
          appointmentDate: overlappingTime,
          duration: 30,
          reason: 'Overlapping appointment'
        })
      ).rejects.toThrow('Doctor is not available');
    });

    it('should allow back-to-back appointments', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      // Create first appointment (10:00 - 10:30)
      await AppointmentService.createAppointment({
        patientId,
        doctorId,
        appointmentDate: tomorrow,
        duration: 30,
        reason: 'First appointment'
      });

      // Create back-to-back appointment (10:30 - 11:00)
      const nextTime = new Date(tomorrow);
      nextTime.setMinutes(30);

      const secondAppt = await AppointmentService.createAppointment({
        patientId,
        doctorId,
        appointmentDate: nextTime,
        duration: 30,
        reason: 'Second appointment'
      });

      expect(secondAppt).toBeDefined();
      expect(secondAppt.appointmentDate).toEqual(nextTime);
    });
  });

  describe('Cascade Deletion', () => {
    it('should prevent deletion of user with active appointments', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      // Create active appointment
      await AppointmentService.createAppointment({
        patientId,
        doctorId,
        appointmentDate: tomorrow,
        duration: 30,
        reason: 'Active appointment'
      });

      // Try to delete patient with active appointment
      await expect(
        UserService.deleteUser(patientId)
      ).rejects.toThrow('Cannot delete user with active appointments');
    });

    it('should allow deletion after cancelling appointments', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      // Create appointment
      const appointment = await AppointmentService.createAppointment({
        patientId,
        doctorId,
        appointmentDate: tomorrow,
        duration: 30,
        reason: 'Test appointment'
      });

      // Cancel appointment
      await AppointmentService.cancelAppointment(appointment._id.toString(), {
        cancelledBy: patientId,
        cancellationReason: 'Test cancellation'
      });

      // Now deletion should succeed
      const result = await UserService.deleteUser(patientId);
      expect(result).toBe(true);

      // Appointment should be archived
      const archivedAppt = await Appointment.findById(appointment._id);
      expect(archivedAppt?.isArchived).toBe(true);
    });
  });

  describe('Race Condition Prevention', () => {
    it('should handle concurrent booking attempts', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      // Create second patient
      const patient2 = await UserService.createUser({
        name: 'Test Patient 2',
        email: 'patient2@test.com',
        password: 'Password123!',
        role: UserRole.PATIENT
      });

      // Try to create two appointments at the same time
      const promises = [
        AppointmentService.createAppointment({
          patientId,
          doctorId,
          appointmentDate: tomorrow,
          duration: 30,
          reason: 'First concurrent'
        }),
        AppointmentService.createAppointment({
          patientId: patient2._id.toString(),
          doctorId,
          appointmentDate: tomorrow,
          duration: 30,
          reason: 'Second concurrent'
        })
      ];

      const results = await Promise.allSettled(promises);

      // One should succeed, one should fail
      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      expect(succeeded).toBe(1);
      expect(failed).toBe(1);
    });
  });
});
