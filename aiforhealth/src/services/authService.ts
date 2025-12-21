import { config } from '@/config/env';
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

// Mock user database
const mockUsers: User[] = [
  {
    id: '1',
    email: 'patient@example.com',
    name: 'John Doe',
    role: 'patient',
    phone: '+1234567890',
    verified: true,
    createdAt: new Date().toISOString()
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
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    verified: true,
    createdAt: new Date().toISOString()
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  /**
   * Login user with email and password
   * JWT-ready: Returns token that can be used for API authentication
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await delay(1000);

    const user = mockUsers.find(u => u.email === credentials.email);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // In production, password would be verified against hashed password
    if (credentials.password !== 'password') {
      throw new Error('Invalid email or password');
    }

    const token = generateMockToken(user);
    const refreshToken = generateMockToken({ ...user, id: `refresh-${user.id}` });

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

    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === data.email);
    if (existingUser) {
      throw new Error('Email already registered');
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
      verified: false,
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

    try {
      // In production, verify refresh token and extract user info
      const payload = JSON.parse(atob(refreshToken.split('.')[1]));
      const userId = payload.sub.replace('refresh-', '');
      const user = mockUsers.find(u => u.id === userId);

      if (!user) {
        throw new Error('Invalid refresh token');
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
  async logout(): Promise<void> {
    await delay(300);
    // In production, would call API to invalidate token
    return;
  },

  /**
   * Request password reset
   * JWT-ready: Would send reset token via email
   */
  async requestPasswordReset(email: string): Promise<void> {
    await delay(1000);
    
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
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await delay(1000);
    
    // In production, would verify token and update password
    console.log('Password reset successful');
  }
};