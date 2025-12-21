import type { LoginCredentials, RegisterData, AuthResponse, User } from '@/types/auth';

// Mock JWT token generation (for demo purposes)
function generateMockToken(user: User): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: user.id,
    email: user.email,
    role: user.role,
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  }));
  const signature = btoa('mock-signature');
  return `${header}.${payload}.${signature}`;
}

// Mock user database with enhanced data
const mockUsers: User[] = [
  {
    id: '1',
    email: 'patient@example.com',
    name: 'John Doe',
    role: 'patient',
    phone: '+1234567890',
    verified: true,
    createdAt: new Date('2024-01-01').toISOString()
  },
  {
    id: '2',
    email: 'doctor@example.com',
    name: 'Dr. Sarah Wilson',
    role: 'doctor',
    phone: '+1234567891',
    specialization: 'Cardiology',
    licenseNumber: 'MD12345',
    verified: true,
    createdAt: new Date('2023-06-15').toISOString()
  },
  {
    id: '3',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    verified: true,
    createdAt: new Date('2023-01-01').toISOString()
  },
  {
    id: '4',
    email: 'patient2@example.com',
    name: 'Jane Smith',
    role: 'patient',
    phone: '+1234567892',
    verified: true,
    createdAt: new Date('2024-02-15').toISOString()
  },
  {
    id: '5',
    email: 'doctor2@example.com',
    name: 'Dr. Michael Chen',
    role: 'doctor',
    phone: '+1234567893',
    specialization: 'Neurology',
    licenseNumber: 'MD67890',
    verified: true,
    createdAt: new Date('2023-08-20').toISOString()
  }
];

// Mock session storage for active sessions
const activeSessions = new Map<string, { userId: string; expiresAt: number }>();

// Simulate API delay with realistic variance
const delay = (ms: number) => new Promise(resolve => 
  setTimeout(resolve, ms + Math.random() * 200)
);

// Simulate network errors occasionally
const simulateNetworkError = (errorRate: number = 0.02) => {
  if (Math.random() < errorRate) {
    throw new Error('Network error: Please check your connection and try again');
  }
};

export const authService = {
  /**
   * Login user with email and password
   * JWT-ready: Returns token that can be used for API authentication
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await delay(1000);
    simulateNetworkError();

    const user = mockUsers.find(u => u.email === credentials.email);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // In production, password would be verified against hashed password
    if (credentials.password !== 'password') {
      throw new Error('Invalid email or password');
    }

    // Check if user is verified
    if (!user.verified && user.role === 'doctor') {
      throw new Error('Account pending verification. Please contact administration.');
    }

    const token = generateMockToken(user);
    const refreshToken = generateMockToken({ ...user, id: `refresh-${user.id}` });

    // Store session
    const sessionId = `session-${Date.now()}`;
    activeSessions.set(sessionId, {
      userId: user.id,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    });

    return {
      user,
      token,
      refreshToken
    };
  },

  /**
   * Register new user
   * JWT-ready: Returns token immediately after registration
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    await delay(1500);
    simulateNetworkError();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('Invalid email format');
    }

    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === data.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Validate doctor-specific fields
    if (data.role === 'doctor') {
      if (!data.specialization) {
        throw new Error('Specialization is required for doctors');
      }
      if (!data.licenseNumber) {
        throw new Error('License number is required for doctors');
      }
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      email: data.email,
      name: data.name,
      role: data.role,
      phone: data.phone,
      specialization: data.specialization,
      licenseNumber: data.licenseNumber,
      verified: data.role === 'patient', // Patients auto-verified, doctors need manual verification
      createdAt: new Date().toISOString()
    };

    mockUsers.push(newUser);

    const token = generateMockToken(newUser);
    const refreshToken = generateMockToken({ ...newUser, id: `refresh-${newUser.id}` });

    return {
      user: newUser,
      token,
      refreshToken
    };
  },

  /**
   * Refresh access token using refresh token
   * JWT-ready: Implements token refresh flow
   */
  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    await delay(500);
    simulateNetworkError();

    try {
      // In production, verify refresh token and extract user info
      const payload = JSON.parse(atob(refreshToken.split('.')[1]));
      const userId = payload.sub.replace('refresh-', '');
      const user = mockUsers.find(u => u.id === userId);

      if (!user) {
        throw new Error('Invalid refresh token');
      }

      // Check if refresh token is expired
      if (payload.exp < Date.now()) {
        throw new Error('Refresh token expired');
      }

      const newToken = generateMockToken(user);
      const newRefreshToken = generateMockToken({ ...user, id: `refresh-${user.id}` });

      return {
        token: newToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  },

  /**
   * Verify JWT token
   * JWT-ready: Validates token structure and expiration
   */
  async verifyToken(token: string): Promise<User> {
    await delay(300);
    simulateNetworkError();

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Check expiration
      if (payload.exp < Date.now()) {
        throw new Error('Token expired');
      }

      const user = mockUsers.find(u => u.id === payload.sub);
      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw new Error('Invalid token');
    }
  },

  /**
   * Logout user
   * JWT-ready: In production, would invalidate token on server
   */
  async logout(sessionId?: string): Promise<void> {
    await delay(300);
    
    // Remove session if provided
    if (sessionId) {
      activeSessions.delete(sessionId);
    }
    
    // In production, would call API to invalidate token
    return;
  },

  /**
   * Request password reset
   * JWT-ready: Would send reset token via email
   */
  async requestPasswordReset(email: string): Promise<void> {
    await delay(1000);
    simulateNetworkError();
    
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      // Don't reveal if email exists for security
      return;
    }

    // In production, would send email with reset token
    console.log(`Password reset email sent to ${email}`);
  },

  /**
   * Reset password with token
   * JWT-ready: Would verify reset token and update password
   */
  async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    await delay(1000);
    simulateNetworkError();
    
    // Validate password strength
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    
    // In production, would verify token and update password
    console.log('Password reset successful for token:', resetToken.substring(0, 10) + '...');
  },

  /**
   * Change password for authenticated user
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    await delay(800);
    simulateNetworkError();

    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password (mock validation)
    if (currentPassword !== 'password') {
      throw new Error('Current password is incorrect');
    }

    // Validate new password
    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long');
    }

    if (newPassword === currentPassword) {
      throw new Error('New password must be different from current password');
    }

    // In production, would hash and store new password
    console.log(`Password changed successfully for user ${userId}`);
  },

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<User> {
    await delay(400);
    simulateNetworkError();

    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  },

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    await delay(800);
    simulateNetworkError();

    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Prevent updating sensitive fields
    const { id, createdAt, ...allowedUpdates } = updates;
    
    mockUsers[userIndex] = { 
      ...mockUsers[userIndex], 
      ...allowedUpdates 
    };

    return mockUsers[userIndex];
  },

  /**
   * Verify user account (for doctors)
   */
  async verifyAccount(userId: string, adminId: string): Promise<void> {
    await delay(600);
    simulateNetworkError();

    const admin = mockUsers.find(u => u.id === adminId && u.role === 'admin');
    if (!admin) {
      throw new Error('Unauthorized: Admin access required');
    }

    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    mockUsers[userIndex].verified = true;
    console.log(`Account verified for user ${userId} by admin ${adminId}`);
  },

  /**
   * Get active sessions (admin only)
   */
  async getActiveSessions(adminId: string): Promise<Array<{ sessionId: string; userId: string; expiresAt: string }>> {
    await delay(500);
    simulateNetworkError();

    const admin = mockUsers.find(u => u.id === adminId && u.role === 'admin');
    if (!admin) {
      throw new Error('Unauthorized: Admin access required');
    }

    return Array.from(activeSessions.entries()).map(([sessionId, session]) => ({
      sessionId,
      userId: session.userId,
      expiresAt: new Date(session.expiresAt).toISOString()
    }));
  }
};