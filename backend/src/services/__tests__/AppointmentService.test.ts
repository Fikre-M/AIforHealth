import { AppointmentService } from '../AppointmentService';
import { User, Appointment } from '@/models';
import { generateObjectId } from '@/test/helpers';

describe('AppointmentService', () => {
  let patientId: string;
  let doctorId: string;

  beforeEach(async () => {
    // Create test patient
    const patient = await User.create({
      name: 'Test Patient',
      email: 'patient@example.com',
      password: 'Password123!',
      role: 'patient',
    });
    patientId = patient._id.toString();

    // Create test doctor
    const doctor = await User.create({
      name: 'Test Doctor',
      email: 'doctor@example.com',
      password: 'Password123!',
      role: 'doctor',
    });
    doctorId = doctor._id.toString();
  });

  describe('createAppointment', () => {
    it('should create appointment successfully', async () => {
      const appointmentData = {
        patient: patientId,
        doctor: doctorId,
        appointmentDate: new Date(Date.now() + 86400000), // Tomorrow
        duration: 30,
        type: 'consultation' as const,
        reason: 'Regular checkup',
      };

      const appointment = await AppointmentService.createAppointment(
        appointmentData
      );

      expect(appointment).toBeDefined();
      expect(appointment.patient.toString()).toBe(patientId);
      expect(appointment.doctor.toString()).toBe(doctorId);
      expect(appointment.status).toBe('scheduled');
    });

    it('should reject appointment in the past', async () => {
      const appointmentData = {
        patient: patientId,
        doctor: doctorId,
        appointmentDate: new Date(Date.now() - 86400000), // Yesterday
        duration: 30,
        type: 'consultation' as const,
        reason: 'Regular checkup',
      };

      await expect(
        AppointmentService.createAppointment(appointmentData)
      ).rejects.toThrow();
    });
  });

  describe('getAppointmentById', () => {
    it('should return appointment by id', async () => {
      const created = await Appointment.create({
        patient: patientId,
        doctor: doctorId,
        appointmentDate: new Date(Date.now() + 86400000),
        duration: 30,
        type: 'consultation',
        reason: 'Test',
        status: 'scheduled',
      });

      const found = await AppointmentService.getAppointmentById(
        created._id.toString()
      );

      expect(found).toBeDefined();
      expect(found?._id.toString()).toBe(created._id.toString());
    });

    it('should return null for non-existent id', async () => {
      const fakeId = generateObjectId();
      const found = await AppointmentService.getAppointmentById(fakeId);

      expect(found).toBeNull();
    });
  });

  describe('updateAppointment', () => {
    it('should update appointment fields', async () => {
      const appointment = await Appointment.create({
        patient: patientId,
        doctor: doctorId,
        appointmentDate: new Date(Date.now() + 86400000),
        duration: 30,
        type: 'consultation',
        reason: 'Original reason',
        status: 'scheduled',
      });

      const updated = await AppointmentService.updateAppointment(
        appointment._id.toString(),
        { notes: 'Updated notes' }
      );

      expect(updated).toBeDefined();
      expect(updated?.notes).toBe('Updated notes');
    });
  });

  describe('cancelAppointment', () => {
    it('should cancel appointment', async () => {
      const appointment = await Appointment.create({
        patient: patientId,
        doctor: doctorId,
        appointmentDate: new Date(Date.now() + 86400000),
        duration: 30,
        type: 'consultation',
        reason: 'Test',
        status: 'scheduled',
      });

      const cancelled = await AppointmentService.cancelAppointment(
        appointment._id.toString(),
        patientId,
        'Patient request'
      );

      expect(cancelled).toBeDefined();
      expect(cancelled?.status).toBe('cancelled');
      expect(cancelled?.cancellationReason).toBe('Patient request');
    });
  });

  describe('getAppointmentsByPatient', () => {
    beforeEach(async () => {
      await Appointment.create({
        patient: patientId,
        doctor: doctorId,
        appointmentDate: new Date(Date.now() + 86400000),
        duration: 30,
        type: 'consultation',
        reason: 'Test 1',
        status: 'scheduled',
      });
      await Appointment.create({
        patient: patientId,
        doctor: doctorId,
        appointmentDate: new Date(Date.now() + 172800000),
        duration: 30,
        type: 'follow-up',
        reason: 'Test 2',
        status: 'scheduled',
      });
    });

    it('should return patient appointments', async () => {
      const result = await AppointmentService.getAppointmentsByPatient(
        patientId,
        { page: 1, limit: 10 }
      );

      expect(result.appointments).toBeDefined();
      expect(result.appointments.length).toBe(2);
      expect(result.pagination.total).toBe(2);
    });
  });
});
