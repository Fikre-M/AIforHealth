// backend/src/routes/authRoutes.ts
import { Router } from 'express';
import { ValidationUtil } from '@/utils/validation';
import { AuthController } from '@/controllers/AuthController';
import { authenticate } from '@/middleware/auth';

const router = Router();

// ✅ REGISTER - Using validation
router.post(
  '/register',
  ValidationUtil.validateUserRegistration(),
  AuthController.register
);

// ✅ LOGIN - Using validation
router.post(
  '/login',
  ValidationUtil.validateUserLogin(),
  AuthController.login
);

// ✅ FORGOT PASSWORD - Using validation
router.post(
  '/forgot-password',
  ValidationUtil.validatePasswordResetRequest(),
  AuthController.requestPasswordReset
);

// ✅ RESET PASSWORD - Using validation
router.post(
  '/reset-password',
  ValidationUtil.validatePasswordReset(),
  AuthController.resetPassword
);

// ✅ CHANGE PASSWORD - Using validation
router.post(
  '/change-password',
  authenticate,
  ValidationUtil.validatePasswordUpdate(),
  AuthController.changePassword
);

// ✅ REFRESH TOKEN
router.post('/refresh-token', AuthController.refreshToken);

// ✅ LOGOUT
router.post('/logout', authenticate, AuthController.logout);

// ✅ VERIFY EMAIL
router.post('/verify-email', AuthController.verifyEmail);

// ✅ GET PROFILE
router.get('/profile', authenticate, AuthController.getProfile);

// ✅ UPDATE PROFILE
router.put('/profile', authenticate, AuthController.updateProfile);

export default router;

// import { Router } from 'express';
// import { AuthController } from '@/controllers/AuthController';
// import { ValidationUtil } from '@/utils';
// import { authenticate } from '@/middleware/auth';

// const router = Router();

// /**
//  * @swagger
//  * tags:
//  *   name: Authentication
//  *   description: User authentication and authorization
//  */

// // Public authentication routes

// /**
//  * @swagger
//  * /auth/register:
//  *   post:
//  *     summary: Register a new user
//  *     tags: [Authentication]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/schemas/RegisterRequest'
//  *     responses:
//  *       201:
//  *         description: User registered successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/AuthResponse'
//  *       400:
//  *         $ref: '#/components/responses/BadRequest'
//  *       409:
//  *         description: User already exists
//  *       429:
//  *         $ref: '#/components/responses/RateLimitExceeded'
//  */
// router.post('/register', ValidationUtil.validateUserRegistration(), AuthController.register);

// /**
//  * @swagger
//  * /auth/login:
//  *   post:
//  *     summary: Login user
//  *     tags: [Authentication]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/schemas/LoginRequest'
//  *     responses:
//  *       200:
//  *         description: Login successful
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/AuthResponse'
//  *       400:
//  *         $ref: '#/components/responses/BadRequest'
//  *       401:
//  *         description: Invalid credentials
//  *       429:
//  *         $ref: '#/components/responses/RateLimitExceeded'
//  */
// router.post('/login', ValidationUtil.validateUserLogin(), AuthController.login);

// /**
//  * @swagger
//  * /auth/refresh-token:
//  *   post:
//  *     summary: Refresh access token
//  *     tags: [Authentication]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - refreshToken
//  *             properties:
//  *               refreshToken:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Token refreshed successfully
//  *       401:
//  *         $ref: '#/components/responses/Unauthorized'
//  */
// router.post('/refresh-token', AuthController.refreshToken);

// /**
//  * @swagger
//  * /auth/request-password-reset:
//  *   post:
//  *     summary: Request password reset
//  *     tags: [Authentication]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - email
//  *             properties:
//  *               email:
//  *                 type: string
//  *                 format: email
//  *     responses:
//  *       200:
//  *         description: Password reset email sent
//  *       400:
//  *         $ref: '#/components/responses/BadRequest'
//  */
// router.post(
//   '/request-password-reset',
//   ValidationUtil.validatePasswordResetRequest(),
//   AuthController.requestPasswordReset
// );

// /**
//  * @swagger
//  * /auth/reset-password:
//  *   post:
//  *     summary: Reset password
//  *     tags: [Authentication]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - token
//  *               - password
//  *             properties:
//  *               token:
//  *                 type: string
//  *               password:
//  *                 type: string
//  *                 format: password
//  *     responses:
//  *       200:
//  *         description: Password reset successful
//  *       400:
//  *         $ref: '#/components/responses/BadRequest'
//  */
// router.post(
//   '/reset-password',
//   ValidationUtil.validatePasswordReset(),
//   AuthController.resetPassword
// );

// /**
//  * @swagger
//  * /auth/verify-email:
//  *   post:
//  *     summary: Verify email address
//  *     tags: [Authentication]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - token
//  *             properties:
//  *               token:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Email verified successfully
//  *       400:
//  *         $ref: '#/components/responses/BadRequest'
//  */
// router.post('/verify-email', AuthController.verifyEmail);

// // Protected authentication routes

// /**
//  * @swagger
//  * /auth/logout:
//  *   post:
//  *     summary: Logout user
//  *     tags: [Authentication]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Logout successful
//  *       401:
//  *         $ref: '#/components/responses/Unauthorized'
//  */
// router.post('/logout', authenticate, AuthController.logout);

// /**
//  * @swagger
//  * /auth/profile:
//  *   get:
//  *     summary: Get user profile
//  *     tags: [Authentication]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Profile retrieved successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                 data:
//  *                   $ref: '#/components/schemas/User'
//  *       401:
//  *         $ref: '#/components/responses/Unauthorized'
//  */
// router.get('/profile', authenticate, AuthController.getProfile);

// /**
//  * @swagger
//  * /auth/profile:
//  *   put:
//  *     summary: Update user profile
//  *     tags: [Authentication]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               name:
//  *                 type: string
//  *               phone:
//  *                 type: string
//  *               dateOfBirth:
//  *                 type: string
//  *                 format: date
//  *               gender:
//  *                 type: string
//  *                 enum: [male, female, other]
//  *               address:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Profile updated successfully
//  *       400:
//  *         $ref: '#/components/responses/BadRequest'
//  *       401:
//  *         $ref: '#/components/responses/Unauthorized'
//  */
// router.put('/profile', authenticate, AuthController.updateProfile);

// /**
//  * @swagger
//  * /auth/profile/avatar:
//  *   post:
//  *     summary: Upload profile avatar
//  *     tags: [Authentication]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         multipart/form-data:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               avatar:
//  *                 type: string
//  *                 format: binary
//  *     responses:
//  *       200:
//  *         description: Avatar uploaded successfully
//  *       401:
//  *         $ref: '#/components/responses/Unauthorized'
//  */
// router.post('/profile/avatar', authenticate, AuthController.uploadAvatar);

// /**
//  * @swagger
//  * /auth/settings:
//  *   get:
//  *     summary: Get user settings
//  *     tags: [Authentication]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Settings retrieved successfully
//  *       401:
//  *         $ref: '#/components/responses/Unauthorized'
//  */
// router.get('/settings', authenticate, AuthController.getSettings);

// /**
//  * @swagger
//  * /auth/settings:
//  *   put:
//  *     summary: Update user settings
//  *     tags: [Authentication]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *     responses:
//  *       200:
//  *         description: Settings updated successfully
//  *       401:
//  *         $ref: '#/components/responses/Unauthorized'
//  */
// router.put('/settings', authenticate, AuthController.updateSettings);

// /**
//  * @swagger
//  * /auth/change-password:
//  *   put:
//  *     summary: Change password
//  *     tags: [Authentication]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - currentPassword
//  *               - newPassword
//  *             properties:
//  *               currentPassword:
//  *                 type: string
//  *                 format: password
//  *               newPassword:
//  *                 type: string
//  *                 format: password
//  *     responses:
//  *       200:
//  *         description: Password changed successfully
//  *       400:
//  *         $ref: '#/components/responses/BadRequest'
//  *       401:
//  *         $ref: '#/components/responses/Unauthorized'
//  */
// router.put(
//   '/change-password',
//   authenticate,
//   ValidationUtil.validatePasswordUpdate(),
//   AuthController.changePassword
// );

// export default router;
