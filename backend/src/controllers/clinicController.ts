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
