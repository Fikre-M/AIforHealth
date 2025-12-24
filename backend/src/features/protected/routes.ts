import { Router } from 'express';
import { ProtectedController } from '@/controllers/ProtectedController';
import { 
  authenticate, 
  authorize, 
  authorizeAny, 
  optionalAuth, 
  ownerOrAdmin, 
  ownerOrRoles, 
  requireVerified, 
  sensitiveOperation 
} from '@/middleware/auth';
import { UserRole } from '@/types';

const router = Router();

// Public endpoint (no authentication)
router.get('/public', ProtectedController.publicEndpoint);

// Optional authentication endpoint
router.get('/optional-auth', optionalAuth, ProtectedController.optionalAuthEndpoint);

// Basic protected endpoint (authentication required)
router.get('/protected', authenticate, ProtectedController.protectedEndpoint);

// Role-based endpoints
router.get('/admin-only', authenticate, authorize(UserRole.ADMIN), ProtectedController.adminOnlyEndpoint);
router.get('/doctor-only', authenticate, authorize(UserRole.DOCTOR), ProtectedController.doctorOnlyEndpoint);
router.get('/patient-only', authenticate, authorize(UserRole.PATIENT), ProtectedController.patientOnlyEndpoint);

// Multiple role endpoint (doctor OR admin)
router.get('/doctor-or-admin', 
  authenticate, 
  authorizeAny(UserRole.DOCTOR, UserRole.ADMIN), 
  ProtectedController.doctorOrAdminEndpoint
);

// Resource-based access (owner or admin)
router.get('/resource/:id/owner-or-admin', 
  authenticate, 
  ownerOrAdmin, 
  ProtectedController.ownerOrAdminEndpoint
);

// Resource-based access (owner or specific roles)
router.get('/resource/:id/owner-or-doctor', 
  authenticate, 
  ownerOrRoles(UserRole.DOCTOR, UserRole.ADMIN), 
  ProtectedController.ownerOrAdminEndpoint
);

// Verified users only
router.get('/verified-only', 
  authenticate, 
  requireVerified, 
  ProtectedController.verifiedOnlyEndpoint
);

// Sensitive operation (admin only with enhanced security)
router.post('/sensitive-operation', 
  authenticate, 
  authorize(UserRole.ADMIN), 
  sensitiveOperation, 
  ProtectedController.sensitiveEndpoint
);

// Complex middleware chain example (verified doctor or admin for sensitive patient data)
router.get('/patient-data/:id', 
  authenticate, 
  requireVerified,
  ownerOrRoles(UserRole.DOCTOR, UserRole.ADMIN),
  sensitiveOperation,
  ProtectedController.sensitiveEndpoint
);

export default router;