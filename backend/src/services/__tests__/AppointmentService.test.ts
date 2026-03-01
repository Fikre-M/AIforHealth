import { AppointmentService } from '../AppointmentService';
import { Appointment } from '@/models/Appointment';
import { NotificationService } from '../NotificationService';
import { AppError } from '@/middleware/errorHandler';

import type { Model } from 'mongoose';

jest.mock('@/models/Appointment');
jest.mock('../NotificationService');

const MockedAppointment = Appointment as jest.Mocked<typeof Appointment>;
const MockedNotificationService = NotificationService as jest.Mocked<typeof NotificationService>;

describe('AppointmentService', () => {
  let mockAppointment: {
    _id: string;
    patientId: string;
    doctorId: string;
    appointmentDate: Date;
    duration: number;
    status: string;
    type: string;
    reason: string;
    notes: string;
    save: jest.Mock;
    toObject: jest.Mock;
  };

  let mockDate: Date;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDate = new Date('2024-01-01T10:00:00.000Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as unknown as string);

    mockAppointment = {
      _id: 'appointment123',
      patientId: 'patient123',
      doctorId: 'doctor123',
      appointmentDate: new Date('2024-01-15T14:00:00.000Z'),
      duration: 30,
      status: 'scheduled',
      type: 'consultation',
      reason: 'Regular checkup',
      notes: '',
      save: jest.fn().mockResolvedValue(true),
      toObject: jest.fn().mockReturnValue({
        _id: 'appointment123',
        patientId: 'patient123',
        doctorId: 'doctor123',
        appointmentDate: new Date('2024-01-15T14:00:00.000Z'),
        status: 'scheduled',
      }),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createAppointment', () => {
    it('should successfully create an appointment', async () => {
      MockedAppointment.findOne.mockResolvedValue(null as never);
      MockedAppointment.create.mockResolvedValue(mockAppointment as never);

      const result = await AppointmentService.createAppointment({
        patientId: 'patient123',
        doctorId: 'doctor123',
        appointmentDate: new Date('2024-01-15T14:00:00.000Z'),
        duration: 30,
        type: 'consultation',
        reason: 'Regular checkup',
      });

      expect(result._id).toBe('appointment123');
      expect(MockedNotificationService.sendAppointmentConfirmation).toHaveBeenCalled();
    });
  });

  describe('cancelAppointment', () => {
    it('should throw error if appointment not found', async () => {
      MockedAppointment.findByIdAndUpdate.mockResolvedValue(null as never);

      await expect(AppointmentService.cancelAppointment('invalid', 'reason')).rejects.toThrow(
        AppError
      );
    });
  });
});
