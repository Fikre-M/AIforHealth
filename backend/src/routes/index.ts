import { Router } from 'express';
import simpleRoutes from './simple';

// Import auth routes
import authRoutes from './authRoutes';

// Import appointment routes
import appointmentRoutes from './appointmentRoutes';

const router = Router();

// Auth routes (login, signup, etc.)
router.use('/auth', authRoutes);

// Appointment routes
router.use('/appointments', appointmentRoutes);

// Simple routes for testing
router.use('/', simpleRoutes);

export default router;