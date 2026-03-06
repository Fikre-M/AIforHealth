import { Request, Response } from 'express';
import { Clinic } from '../models/Clinic';
import User from '../models/User';
import { ResponseUtil, asyncHandler } from '../utils';
import { UserRole } from '../types';

/**
 * Get all clinics
 */
export const getClinics = asyncHandler(async (req: Request, res: Response) => {
  const { search, specialty, limit = 20, page = 1 } = req.query;

  const query: any = {};

  // Search by name or address
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { address: { $regex: search, $options: 'i' } },
    ];
  }

  // Filter by specialty
  if (specialty) {
    query.specialties = { $in: [specialty] };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [clinics, total] = await Promise.all([
    Clinic.find(query).sort({ rating: -1, name: 1 }).limit(Number(limit)).skip(skip),
    Clinic.countDocuments(query),
  ]);

  ResponseUtil.success(
    res,
    {
      clinics,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    },
    'Clinics retrieved successfully'
  );
});

/**
 * Get clinic by ID
 */
export const getClinicById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const clinic = await Clinic.findById(id);

  if (!clinic) {
    return ResponseUtil.error(res, 'Clinic not found', 404);
  }

  ResponseUtil.success(res, { clinic }, 'Clinic retrieved successfully');
});

/**
 * Get doctors by clinic ID
 */
export const getDoctorsByClinic = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { specialty, available, limit = 20, page = 1 } = req.query;

  // First verify clinic exists
  const clinic = await Clinic.findById(id);
  if (!clinic) {
    return ResponseUtil.error(res, 'Clinic not found', 404);
  }

  const query: any = {
    role: UserRole.DOCTOR,
    'profile.clinicId': id,
  };

  // Filter by specialty
  if (specialty) {
    query['profile.specialty'] = specialty;
  }

  // Filter by availability (if needed)
  if (available === 'true') {
    query['profile.isAvailable'] = true;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [doctors, total] = await Promise.all([
    User.find(query, '-password')
      .sort({ 'profile.rating': -1, name: 1 })
      .limit(Number(limit))
      .skip(skip),
    User.countDocuments(query),
  ]);

  // Transform doctors to match frontend expectations
  const transformedDoctors = doctors.map((doctor: any) => ({
    id: doctor._id,
    name: doctor.name,
    specialty: doctor.profile?.specialty || 'General Medicine',
    clinicId: id,
    clinicName: clinic.name,
    rating: doctor.profile?.rating || 4.0,
    experience: doctor.profile?.experience || 5,
    education: doctor.profile?.education || ['Medical Degree'],
    languages: doctor.profile?.languages || ['English'],
    avatar: doctor.profile?.avatar,
    consultationFee: doctor.profile?.consultationFee || 100,
    nextAvailable: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    isAvailable: doctor.profile?.isAvailable !== false,
  }));

  ResponseUtil.success(
    res,
    {
      doctors: transformedDoctors,
      clinic: {
        id: clinic._id,
        name: clinic.name,
      },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    },
    'Doctors retrieved successfully'
  );
});

/**
 * Create clinic (Admin only)
 */
export const createClinic = asyncHandler(async (req: Request, res: Response) => {
  const clinicData = req.body;

  const clinic = new Clinic(clinicData);
  await clinic.save();

  ResponseUtil.success(res, { clinic }, 'Clinic created successfully', 201);
});

/**
 * Update clinic (Admin only)
 */
export const updateClinic = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const clinic = await Clinic.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

  if (!clinic) {
    return ResponseUtil.error(res, 'Clinic not found', 404);
  }

  ResponseUtil.success(res, { clinic }, 'Clinic updated successfully');
});

/**
 * Get doctor availability for booking
 */
export const getDoctorAvailability = asyncHandler(async (req: Request, res: Response) => {
  const { doctorId } = req.params;
  const { startDate, endDate } = req.query;

  // Verify doctor exists
  const doctor = await User.findOne({ _id: doctorId, role: UserRole.DOCTOR });
  if (!doctor) {
    return ResponseUtil.error(res, 'Doctor not found', 404);
  }

  // Generate availability for the date range
  const start = new Date(startDate as string);
  const end = new Date(endDate as string);
  const availability = [];

  // Generate time slots for each day
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const dateStr = date.toISOString().split('T')[0];
    
    // Generate slots from 9 AM to 5 PM (every 30 minutes)
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          time,
          available: true, // In production, check against existing appointments
          type: 'regular',
          duration: 30
        });
      }
    }

    availability.push({
      date: dateStr,
      dayOfWeek,
      isAvailable: slots.length > 0,
      slots
    });
  }

  ResponseUtil.success(res, availability, 'Doctor availability retrieved successfully');
});

/**
 * Delete clinic (Admin only)
 */
export const deleteClinic = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const clinic = await Clinic.findByIdAndDelete(id);

  if (!clinic) {
    return ResponseUtil.error(res, 'Clinic not found', 404);
  }

  ResponseUtil.success(res, null, 'Clinic deleted successfully');
});
