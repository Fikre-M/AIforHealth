import { AppointmentService } from '../AppointmentService';
import { Appointment } from '@/models/Appointment';
import { User } from '@/models/User';
import { NotificationService } from '../NotificationService';
import { AppError } from '@/middleware/errorHandler';

// Mock dependencies
jest.mock('@/models/Appointment');
jest.mock('@/models/User');
jest.mock('../NotificationService');

describe('AppointmentService', () => {
  let mockAppointment: any;
  let mockDate: Date;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDate = new Date('2024-01-01T10:00:00.000Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

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
    const appointmentData = {
      patientId: 'patient123',
      doctorId: 'doctor123',
      appointmentDate: new Date('2024-01-15T14:00:00.000Z'),
      duration: 30,
      type: 'consultation',
      reason: 'Regular checkup',
    };

    it('should successfully create an appointment', async () => {
      // Arrange
      (Appointment.findOne as jest.Mock).mockResolvedValue(null);
      (Appointment.create as jest.Mock).mockResolvedValue(mockAppointment);

      // Act
      const result = await AppointmentService.createAppointment(appointmentData);

      // Assert
      expect(result).toBeDefined();
      expect(result._id).toBe('appointment123');
      expect(Appointment.findOne).toHaveBeenCalledWith({
        doctorId: 'doctor123',
        appointmentDate: appointmentData.appointmentDate,
        status: { $ne: 'cancelled' },
      });
      expect(Appointment.create).toHaveBeenCalledWith(appointmentData);
      expect(NotificationService.sendAppointmentConfirmation).toHaveBeenCalled();
    });

    it('should throw error if time slot is already booked', async () => {
      // Arrange
      (Appointment.findOne as jest.Mock).mockResolvedValue(mockAppointment);

      // Act & Assert
      await expect(AppointmentService.createAppointment(appointmentData)).rejects.toThrow(
        'Time slot already booked'
      );

      expect(Appointment.create).not.toHaveBeenCalled();
    });

    it('should validate appointment time is within working hours', async () => {
      // Arrange
      const invalidTimeData = {
        ...appointmentData,
        appointmentDate: new Date('2024-01-15T20:00:00.000Z'), // 8 PM
      };
      (Appointment.findOne as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(AppointmentService.createAppointment(invalidTimeData)).rejects.toThrow(
        'outside working hours'
      );
    });

    it('should validate appointment is not on weekend', async () => {
      // Arrange
      const weekendData = {
        ...appointmentData,
        appointmentDate: new Date('2024-01-13T14:00:00.000Z'), // Saturday
      };
      (Appointment.findOne as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(AppointmentService.createAppointment(weekendData)).rejects.toThrow('weekend');
    });

    it('should validate duration is valid', async () => {
      // Arrange
      const invalidDurationData = {
        ...appointmentData,
        duration: 45, // 45 minutes (not multiple of 15)
      };
      (Appointment.findOne as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(AppointmentService.createAppointment(invalidDurationData)).rejects.toThrow(
        'Duration must be in increments of 15 minutes'
      );
    });
  });

  describe('getAppointments', () => {
    it('should return paginated appointments', async () => {
      // Arrange
      const filters = { page: 1, limit: 10, status: 'scheduled' };
      const mockAppointments = [mockAppointment, { ...mockAppointment, _id: 'appointment456' }];

      (Appointment.find as jest.Mock).mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              sort: jest.fn().mockResolvedValue(mockAppointments),
            }),
          }),
        }),
      });
      (Appointment.countDocuments as jest.Mock).mockResolvedValue(15);

      // Act
      const result = await AppointmentService.getAppointments(filters);

      // Assert
      expect(result.appointments).toHaveLength(2);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 15,
        pages: 2,
      });
    });

    it('should apply date range filters correctly', async () => {
      // Arrange
      const filters = {
        page: 1,
        limit: 10,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };

      // Act
      await AppointmentService.getAppointments(filters);

      // Assert
      expect(Appointment.find).toHaveBeenCalledWith({
        appointmentDate: {
          $gte: new Date('2024-01-01'),
          $lte: new Date('2024-01-31'),
        },
      });
    });
  });

  describe('cancelAppointment', () => {
    it('should successfully cancel an appointment', async () => {
      // Arrange
      const appointmentId = 'appointment123';
      const reason = 'Patient unavailable';

      (Appointment.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        ...mockAppointment,
        status: 'cancelled',
        cancellationReason: reason,
      });

      // Act
      const result = await AppointmentService.cancelAppointment(appointmentId, reason);

      // Assert
      expect(result.status).toBe('cancelled');
      expect(result.cancellationReason).toBe(reason);
      expect(Appointment.findByIdAndUpdate).toHaveBeenCalledWith(
        appointmentId,
        {
          status: 'cancelled',
          cancellationReason: reason,
          cancelledAt: mockDate,
        },
        { new: true }
      );
      expect(NotificationService.sendCancellationNotification).toHaveBeenCalled();
    });

    it('should throw error if appointment not found', async () => {
      // Arrange
      (Appointment.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(AppointmentService.cancelAppointment('nonexistent', 'reason')).rejects.toThrow(
        'Appointment not found'
      );
    });

    it('should not allow cancelling completed appointments', async () => {
      // Arrange
      const completedAppointment = { ...mockAppointment, status: 'completed' };
      (Appointment.findById as jest.Mock).mockResolvedValue(completedAppointment);

      // Act & Assert
      await expect(
        AppointmentService.cancelAppointment('appointment123', 'reason')
      ).rejects.toThrow('Cannot cancel completed appointment');
    });
  });

  describe('rescheduleAppointment', () => {
    const newDate = new Date('2024-01-16T15:00:00.000Z');

    it('should successfully reschedule an appointment', async () => {
      // Arrange
      (Appointment.findById as jest.Mock).mockResolvedValue(mockAppointment);
      (Appointment.findOne as jest.Mock).mockResolvedValue(null);
      (Appointment.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        ...mockAppointment,
        appointmentDate: newDate,
        status: 'rescheduled',
      });

      // Act
      const result = await AppointmentService.rescheduleAppointment(
        'appointment123',
        newDate,
        'Work conflict'
      );

      // Assert
      expect(result.appointmentDate).toBe(newDate);
      expect(result.status).toBe('rescheduled');
      expect(NotificationService.sendRescheduleNotification).toHaveBeenCalled();
    });

    it('should throw error if new time slot is not available', async () => {
      // Arrange
      (Appointment.findById as jest.Mock).mockResolvedValue(mockAppointment);
      (Appointment.findOne as jest.Mock).mockResolvedValue({
        ...mockAppointment,
        _id: 'other',
      });

      // Act & Assert
      await expect(
        AppointmentService.rescheduleAppointment('appointment123', newDate, 'reason')
      ).rejects.toThrow('New time slot is not available');
    });

    it('should throw error if rescheduling too close to appointment time', async () => {
      // Arrange
      const tooCloseDate = new Date(mockDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
      mockAppointment.appointmentDate = tooCloseDate;
      (Appointment.findById as jest.Mock).mockResolvedValue(mockAppointment);

      // Act & Assert
      await expect(
        AppointmentService.rescheduleAppointment('appointment123', newDate, 'reason')
      ).rejects.toThrow('Cannot reschedule within 24 hours of appointment');
    });
  });

  describe('completeAppointment', () => {
    const completionData = {
      notes: 'Patient is doing well',
      diagnosis: 'Mild hypertension',
      prescription: 'Medication X 10mg daily',
    };

    it('should successfully complete an appointment', async () => {
      // Arrange
      (Appointment.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        ...mockAppointment,
        status: 'completed',
        ...completionData,
      });

      // Act
      const result = await AppointmentService.completeAppointment('appointment123', completionData);

      // Assert
      expect(result.status).toBe('completed');
      expect(result.notes).toBe(completionData.notes);
      expect(result.diagnosis).toBe(completionData.diagnosis);
      expect(result.prescription).toBe(completionData.prescription);
      expect(Appointment.findByIdAndUpdate).toHaveBeenCalledWith(
        'appointment123',
        {
          status: 'completed',
          completedAt: mockDate,
          ...completionData,
        },
        { new: true }
      );
    });

    it('should throw error if appointment not found', async () => {
      // Arrange
      (Appointment.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        AppointmentService.completeAppointment('nonexistent', completionData)
      ).rejects.toThrow('Appointment not found');
    });
  });

  describe('getAppointmentStatistics', () => {
    it('should return appointment statistics', async () => {
      // Arrange
      const mockStats = [
        { _id: 'scheduled', count: 10 },
        { _id: 'completed', count: 5 },
        { _id: 'cancelled', count: 2 },
      ];

      (Appointment.aggregate as jest.Mock).mockResolvedValue(mockStats);

      // Act
      const result = await AppointmentService.getAppointmentStatistics({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      // Assert
      expect(result).toEqual({
        total: 17,
        byStatus: {
          scheduled: 10,
          completed: 5,
          cancelled: 2,
        },
        period: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
      });
    });

    it('should handle empty statistics', async () => {
      // Arrange
      (Appointment.aggregate as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await AppointmentService.getAppointmentStatistics({});

      // Assert
      expect(result).toEqual({
        total: 0,
        byStatus: {},
        period: {
          startDate: 'all',
          endDate: 'all',
        },
      });
    });
  });

  describe('checkAvailability', () => {
    it('should return true for available time slot', async () => {
      // Arrange
      (Appointment.findOne as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await AppointmentService.checkAvailability(
        'doctor123',
        new Date('2024-01-15T14:00:00.000Z'),
        30
      );

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for booked time slot', async () => {
      // Arrange
      (Appointment.findOne as jest.Mock).mockResolvedValue(mockAppointment);

      // Act
      const result = await AppointmentService.checkAvailability(
        'doctor123',
        new Date('2024-01-15T14:00:00.000Z'),
        30
      );

      // Assert
      expect(result).toBe(false);
    });

    it('should check doctor availability for the day', async () => {
      // Arrange
      const date = new Date('2024-01-15T14:00:00.000Z');
      (Appointment.countDocuments as jest.Mock).mockResolvedValue(8); // 8 appointments already

      // Act
      const result = await AppointmentService.checkAvailability('doctor123', date, 30);

      // Assert
      expect(Appointment.countDocuments).toHaveBeenCalledWith({
        doctorId: 'doctor123',
        appointmentDate: {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lte: new Date(date.setHours(23, 59, 59, 999)),
        },
        status: { $ne: 'cancelled' },
      });
    });
  });

  describe('getUpcomingAppointments', () => {
    it('should return upcoming appointments for a user', async () => {
      // Arrange
      const userId = 'patient123';
      const mockAppointments = [mockAppointment];

      (Appointment.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockAppointments),
        }),
      });

      // Act
      const result = await AppointmentService.getUpcomingAppointments(userId, 'patient');

      // Assert
      expect(result).toHaveLength(1);
      expect(Appointment.find).toHaveBeenCalledWith({
        patientId: userId,
        appointmentDate: { $gte: mockDate },
        status: { $in: ['scheduled', 'confirmed'] },
      });
    });

    it('should return empty array if no upcoming appointments', async () => {
      // Arrange
      (Appointment.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue([]),
        }),
      });

      // Act
      const result = await AppointmentService.getUpcomingAppointments('patient123', 'patient');

      // Assert
      expect(result).toHaveLength(0);
    });
  });
});
