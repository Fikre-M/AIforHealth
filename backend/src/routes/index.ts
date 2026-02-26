import { Router } from 'express';
import simpleRoutes from './simple';

// Import auth routes
import authRoutes from './authRoutes';

// Import appointment routes
import appointmentRoutes from './appointmentRoutes';

// Import notification routes
import notificationRoutes from './notificationRoutes';

// Import health routes
import healthRoutes from './healthRoutes';

// Import patient routes
import patientRoutes from './patientRoutes';

// Import doctor routes
import doctorRoutes from './doctorRoutes';

// Import clinic routes
import clinicRoutes from './clinicRoutes';

// Import AI assistant routes
import aiAssistantRoutes from './aiAssistantRoutes';

// Import monitoring routes
import monitoringRoutes from './monitoringRoutes';

// Import admin routes
import adminRoutes from './adminRoutes';

const router = Router();

// Auth routes (login, signup, etc.)
router.use('/auth', authRoutes);

// Appointment routes
router.use('/appointments', appointmentRoutes);

// Notification routes
router.use('/notifications', notificationRoutes);

// Health routes (medications, reminders, metrics)
router.use('/health', healthRoutes);

// Patient routes
router.use('/patients', patientRoutes);

// Doctor routes
router.use('/doctors', doctorRoutes);

// Clinic routes
router.use('/clinics', clinicRoutes);

// AI Assistant routes
router.use('/ai-assistant', aiAssistantRoutes);

// Monitoring routes
router.use('/monitoring', monitoringRoutes);

// Admin routes
router.use('/admin', adminRoutes);

// Simple routes for testing
router.use('/', simpleRoutes);

export default router;
