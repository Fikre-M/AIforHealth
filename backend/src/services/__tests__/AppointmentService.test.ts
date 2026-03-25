import { AppointmentService } from '../AppointmentService';
import { User } from '@/models/User';
import { UserRole } from '@/types';
import { generateObjectId } from '@/test/helpers';
import notificationService from '@/services/NotificationService';

import type { INotification } from '@/models/Notification';

// Spy on the singleton instance methods so AppointmentService picks up the mocks
jest
  .spyOn(notificationService, 'createAppointmentConfirmation')
  .mockResolvedValue({} as INotification);
jest
  .spyOn(notificationService, 'createAppointmentCancellation')
  .mockResolvedValue({} as INotification);

// Uses the global in-memory MongoDB from src/test/setup.ts

describe('AppointmentService', () => {
  let patientId: string;
  let doctorId: string;
  let futureDate: Date;

  beforeEach(async () => {
    const patient = await User.create({
      name: 'Test Patient',
      email: 'patient@example.com',
      password: 'Password123!',
      role: UserRole.PATIENT,
    });
    patientId = patient._id.toString();

    const doctor = await User.create({
      name: 'Dr. Test',
      email: 'doctor@example.com',
      password: 'Password123!',
      role: UserRole.DOCTOR,
    });
    doctorId = doctor._id.toString();

    futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week from now
  });

  describe('createAppointment', () => {
    it('should create an appointment successfully', async () => {
      const appointment = await AppointmentService.createAppointment({
        patientId,
        doctorId,
        appointmentDate: futureDate,
        duration: 30,
        type: 'consultation',
        reason: 'Regular checkup',
      });

      expect(appointment).toBeDefined();
      expect(appointment.patient.toString()).toBe(patientId);
      expect(appointment.doctor.toString()).toBe(doctorId);
      expect(appointment.status).toBe('scheduled');
    });

    it('should generate a confirmation number', async () => {
      const appointment = await AppointmentService.createAppointment({
        patientId,
        doctorId,
        appointmentDate: futureDate,
        duration: 30,
        type: 'consultation',
        reason: 'Checkup',
      });

      expect(appointment.confirmationNumber).toBeDefined();
      expect(appointment.confirmationNumber).toMatch(/^APT-/);
    });

    it('should throw 409 if time slot is already booked', async () => {
      await AppointmentService.createAppointment({
        patientId,
        doctorId,
        appointmentDate: futureDate,
        duration: 30,
        type: 'consultation',
        reason: 'First booking',
      });

      await expect(
        AppointmentService.createAppointment({
          patientId,
          doctorId,
          appointmentDate: futureDate,
          duration: 30,
          type: 'consultation',
          reason: 'Conflicting booking',
        })
      ).rejects.toThrow(/already booked/i);
    });
  });

  describe('cancelAppointment', () => {
    it('should cancel an existing appointment', async () => {
      const created = await AppointmentService.createAppointment({
        patientId,
        doctorId,
        appointmentDate: futureDate,
        duration: 30,
        type: 'consultation',
        reason: 'To be cancelled',
      });

      const cancelled = await AppointmentService.cancelAppointment(
        created._id.toString(),
        'Patient request'
      );

      expect(cancelled).toBeDefined();
      expect(cancelled.status).toBe('cancelled');
    });

    it('should return null for a non-existent appointment', async () => {
      const result = await AppointmentService.cancelAppointment(generateObjectId(), 'reason');
      expect(result).toBeNull();
    });
  });

  describe('getAppointmentById', () => {
    it('should return appointment by id', async () => {
      const created = await AppointmentService.createAppointment({
        patientId,
        doctorId,
        appointmentDate: futureDate,
        duration: 30,
        type: 'consultation',
        reason: 'Lookup test',
      });

      const found = await AppointmentService.getAppointmentById(created._id.toString());
      expect(found).toBeDefined();
      expect(found._id.toString()).toBe(created._id.toString());
    });

    it('should throw for invalid id format', async () => {
      await expect(AppointmentService.getAppointmentById('not-an-id')).rejects.toThrow();
    });
  });

  describe('checkAvailability', () => {
    it('should return true when slot is free', async () => {
      const available = await AppointmentService.checkAvailability(doctorId, futureDate);
      expect(available).toBe(true);
    });

    it('should return false when slot is taken', async () => {
      await AppointmentService.createAppointment({
        patientId,
        doctorId,
        appointmentDate: futureDate,
        duration: 30,
        type: 'consultation',
        reason: 'Blocking slot',
      });

      const available = await AppointmentService.checkAvailability(doctorId, futureDate);
      expect(available).toBe(false);
    });
  });

  describe('getAppointmentStatistics', () => {
    it('should return zero stats when no appointments exist', async () => {
      const stats = await AppointmentService.getAppointmentStatistics({});
      expect(stats.total).toBe(0);
      expect(stats.completionRate).toBe(0);
    });

    it('should calculate completion rate correctly', async () => {
      const apt = await AppointmentService.createAppointment({
        patientId,
        doctorId,
        appointmentDate: futureDate,
        duration: 30,
        type: 'consultation',
        reason: 'Stats test',
      });

      await AppointmentService.completeAppointment(apt._id.toString(), { notes: 'All good' });

      const stats = await AppointmentService.getAppointmentStatistics({ doctorId });

      expect(stats.completed).toBe(1);
      expect(stats.completionRate).toBe(100);
    });
  });
});
