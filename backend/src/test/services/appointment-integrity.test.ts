import mongoose from 'mongoose';
import { AppointmentService } from '@/services/AppointmentService';
import { UserService } from '@/services/UserService';
import { User, Appointment } from '@/models';
import { UserRole } from '@/types';
import { AppointmentStatus } from '@/models/Appointment';

describe('Appointment Integrity', () => {
  let patientId: string;
  let doctorId: string;

  beforeEach(async () => {
    const patient = await UserService.createUser({
      name: 'P',
      email: 'p@test.com',
      password: 'Pass123!',
      role: UserRole.PATIENT,
    });
    patientId = patient._id.toString();
    const doctor = await UserService.createUser({
      name: 'D',
      email: 'd@test.com',
      password: 'Pass123!',
      role: UserRole.DOCTOR,
    });
    doctorId = doctor._id.toString();
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Appointment.deleteMany({});
  });

  it('should prevent overlapping appointments', async () => {
    const time = new Date();
    time.setHours(time.getHours() + 1);
    await AppointmentService.createAppointment({
      patientId,
      doctorId,
      appointmentDate: time,
      duration: 30,
      reason: 'Checkup',
    });

    const overlapTime = new Date(time);
    overlapTime.setMinutes(time.getMinutes() + 15);

    await expect(
      AppointmentService.createAppointment({
        patientId,
        doctorId,
        appointmentDate: overlapTime,
        duration: 30,
        reason: 'Overlap',
      })
    ).rejects.toThrow();
  });

  it('should allow back-to-back appointments', async () => {
    const time = new Date();
    time.setHours(time.getHours() + 2);

    await AppointmentService.createAppointment({
      patientId,
      doctorId,
      appointmentDate: time,
      duration: 30,
      reason: 'First',
    });
    const nextTime = new Date(time);
    nextTime.setMinutes(time.getMinutes() + 30);
    const appt2 = await AppointmentService.createAppointment({
      patientId,
      doctorId,
      appointmentDate: nextTime,
      duration: 30,
      reason: 'Second',
    });
    expect(appt2).toBeDefined();
  });
});
