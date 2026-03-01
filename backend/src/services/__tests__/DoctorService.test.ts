import { DoctorService } from '../DoctorService';
import { UserRole } from '@/types';
import { User } from '@/models/User';
import { Appointment } from '@/models/Appointment';
import { AppointmentStatus } from '@/types';

describe('DoctorService', () => {
  let doctorId: string;
  let patientId: string;
  let otherDoctorId: string;
  let otherPatientId: string;

  beforeEach(async () => {
    const doctor = await User.create({
      name: 'Dr. Smith',
      email: 'drsmith@example.com',
      password: 'Password123!',
      role: UserRole.DOCTOR,
      specialization: 'Cardiology',
    });
    doctorId = doctor._id.toString();

    const patient = await User.create({
      name: 'Patient One',
      email: 'patient1@example.com',
      password: 'Password123!',
      role: UserRole.PATIENT,
    });
    patientId = patient._id.toString();

    const otherDoctor = await User.create({
      name: 'Dr. Jones',
      email: 'drjones@example.com',
      password: 'Password123!',
      role: UserRole.DOCTOR,
    });
    otherDoctorId = otherDoctor._id.toString();

    const otherPatient = await User.create({
      name: 'Patient Two',
      email: 'patient2@example.com',
      password: 'Password123!',
      role: UserRole.PATIENT,
    });
    otherPatientId = otherPatient._id.toString();
  });

  describe('getDailyAppointments', () => {
    it('should get doctor daily appointments', async () => {
      const today = new Date();
      today.setHours(10, 0, 0, 0);

      await Appointment.create({
        patient: patientId,
        doctor: doctorId,
        appointmentDate: today,
        duration: 30,
        type: 'consultation',
        reason: 'Checkup',
        status: AppointmentStatus.SCHEDULED,
      });

      const appointments = await DoctorService.getDailyAppointments(doctorId);

      expect(appointments).toBeDefined();
      expect(appointments.length).toBeGreaterThan(0);
      expect(appointments[0].doctor?.toString()).toBe(doctorId);
    });

    it('should only return today appointments', async () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      await Appointment.create([
        {
          patient: patientId,
          doctor: doctorId,
          appointmentDate: today,
          duration: 30,
          type: 'consultation',
          reason: 'Today',
          status: AppointmentStatus.SCHEDULED,
        },
        {
          patient: patientId,
          doctor: doctorId,
          appointmentDate: tomorrow,
          duration: 30,
          type: 'consultation',
          reason: 'Tomorrow',
          status: AppointmentStatus.SCHEDULED,
        },
      ]);

      const appointments = await DoctorService.getDailyAppointments(doctorId);

      expect(appointments.length).toBe(1);
      expect(appointments[0].reason).toBe('Today');
    });
  });

  describe('getPatientsList', () => {
    it('should get doctor patients', async () => {
      await Appointment.create({
        patient: patientId,
        doctor: doctorId,
        appointmentDate: new Date(),
        duration: 30,
        type: 'consultation',
        reason: 'Checkup',
        status: AppointmentStatus.COMPLETED,
      });

      const result = await DoctorService.getPatientsList(doctorId);

      expect(result.patients).toBeDefined();
      expect(result.patients.length).toBeGreaterThan(0);
      expect(result.patients[0]._id.toString()).toBe(patientId);
    });

    it('should not show patients from other doctors', async () => {
      await Appointment.create({
        patient: otherPatientId,
        doctor: otherDoctorId,
        appointmentDate: new Date(),
        duration: 30,
        type: 'consultation',
        reason: 'Other doctor appointment',
        status: AppointmentStatus.COMPLETED,
      });

      const result = await DoctorService.getPatientsList(doctorId);

      const hasOtherPatient = result.patients.some(
        p => p._id.toString() === otherPatientId
      );
      expect(hasOtherPatient).toBe(false);
    });

    it('should support pagination', async () => {
      await Appointment.create({
        patient: patientId,
        doctor: doctorId,
        appointmentDate: new Date(),
        duration: 30,
        type: 'consultation',
        reason: 'Checkup',
        status: AppointmentStatus.COMPLETED,
      });

      const result = await DoctorService.getPatientsList(doctorId, {
        page: 1,
        limit: 10,
      });

      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });
  });

  describe('getPatientDetails', () => {
    it('should get patient details if doctor has treated them', async () => {
      await Appointment.create({
        patient: patientId,
        doctor: doctorId,
        appointmentDate: new Date(),
        duration: 30,
        type: 'consultation',
        reason: 'Checkup',
        status: AppointmentStatus.COMPLETED,
      });

      const patient = await DoctorService.getPatientDetails(doctorId, patientId);

      expect(patient).toBeDefined();
      expect(patient?._id.toString()).toBe(patientId);
    });

    it('should not allow doctor to see other doctors patients', async () => {
      await Appointment.create({
        patient: otherPatientId,
        doctor: otherDoctorId,
        appointmentDate: new Date(),
        duration: 30,
        type: 'consultation',
        reason: 'Other doctor',
        status: AppointmentStatus.COMPLETED,
      });

      await expect(
        DoctorService.getPatientDetails(doctorId, otherPatientId)
      ).rejects.toThrow(/Access denied/i);
    });
  });

  describe('createPatient', () => {
    it('should create patient', async () => {
      const patientData = {
        name: 'New Patient',
        email: 'newpatient@example.com',
        password: 'Password123!',
        phone: '123-456-7890',
      };

      const patient = await DoctorService.createPatient(doctorId, patientData);

      expect(patient).toBeDefined();
      expect(patient.email).toBe('newpatient@example.com');
      expect(patient.role).toBe(UserRole.PATIENT);
    });
  });

  describe('getDoctorStats', () => {
    it('should get doctor statistics', async () => {
      await Appointment.create([
        {
          patient: patientId,
          doctor: doctorId,
          appointmentDate: new Date(),
          duration: 30,
          type: 'consultation',
          reason: 'Checkup',
          status: AppointmentStatus.COMPLETED,
        },
        {
          patient: patientId,
          doctor: doctorId,
          appointmentDate: new Date(Date.now() + 86400000),
          duration: 30,
          type: 'consultation',
          reason: 'Follow-up',
          status: AppointmentStatus.SCHEDULED,
        },
      ]);

      const stats = await DoctorService.getDoctorStats(doctorId);

      expect(stats).toBeDefined();
      expect(stats.totalPatients).toBeGreaterThan(0);
      expect(stats.completedAppointments).toBeGreaterThan(0);
    });
  });

  describe('getDoctorPerformance', () => {
    it('should calculate performance metrics', async () => {
      await Appointment.create([
        {
          patient: patientId,
          doctor: doctorId,
          appointmentDate: new Date(),
          duration: 30,
          type: 'consultation',
          reason: 'Checkup',
          status: AppointmentStatus.COMPLETED,
        },
        {
          patient: patientId,
          doctor: doctorId,
          appointmentDate: new Date(),
          duration: 30,
          type: 'consultation',
          reason: 'Cancelled',
          status: AppointmentStatus.CANCELLED,
        },
      ]);

      const performance = await DoctorService.getDoctorPerformance(doctorId);

      expect(performance).toBeDefined();
      expect(performance.totalAppointments).toBe(2);
      expect(performance.completedAppointments).toBe(1);
      expect(performance.completionRate).toBe(50);
    });
  });

  describe('searchDoctors', () => {
    it('should search doctors by specialization', async () => {
      const result = await DoctorService.searchDoctors({
        specialization: 'Cardiology',
      });

      expect(result.doctors).toBeDefined();
      expect(result.doctors.length).toBeGreaterThan(0);
      expect(result.doctors[0].specialization).toMatch(/Cardiology/i);
    });

    it('should search doctors by name', async () => {
      const result = await DoctorService.searchDoctors({
        search: 'Smith',
      });

      expect(result.doctors).toBeDefined();
      expect(result.doctors.some(d => d.name.includes('Smith'))).toBe(true);
    });
  });
});
