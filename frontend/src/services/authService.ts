// src/services/authService.ts
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
} from "@/types/auth";
import api from "./api";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post("/auth/login", credentials);
      const { user, tokens } = response.data.data; // Note: backend returns data.data

      // Store tokens
      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      return {
        user,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error: any) {
      console.error("Login failed:", error);
      
      // Provide more specific error messages
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'Login failed';
        
        if (status === 401) {
          throw new Error('Invalid email or password');
        } else if (status === 429) {
          throw new Error('Too many login attempts. Please try again later.');
        } else if (status === 423) {
          throw new Error('Account is temporarily locked. Please try again later.');
        } else {
          throw new Error(message);
        }
      } else if (error.request) {
        throw new Error("No response from server. Please try again.");
      } else {
        throw new Error("Request failed. Please check your connection.");
      }
    }
  },

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/register', {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role || 'patient',
      });

      const { user, tokens } = response.data.data;
      
      // Store tokens
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      return {
        user,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'Registration failed';
        const errors = error.response.data?.errors;
        
        if (status === 409 || message.includes('already exists')) {
          throw new Error('An account with this email already exists');
        } else if (status === 400) {
          if (errors && Array.isArray(errors)) {
            // Handle validation errors
            const validationError = errors[0];
            throw new Error(validationError.msg || 'Please check your information and try again');
          }
          throw new Error('Please check your information and try again');
        } else {
          throw new Error(message);
        }
      }
      
      throw new Error('Network error. Please check your connection.');
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Clear tokens and user data
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  },

  async requestPasswordReset(email: string): Promise<void> {
    try {
      await api.post("/auth/request-password-reset", { email });
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Don't reveal if email exists for security
        return;
      }
      throw error;
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await api.post("/auth/reset-password", { token, password: newPassword });
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error('Invalid or expired reset token');
      }
      throw error;
    }
  },

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      await api.put("/auth/change-password", { currentPassword, newPassword });
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error('Current password is incorrect');
      }
      throw error;
    }
  },

  async getProfile(): Promise<User> {
    try {
      const response = await api.get("/auth/profile");
      return response.data.data; // Backend returns data.data
    } catch (error) {
      throw error;
    }
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const response = await api.put("/auth/profile", updates);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  async refreshToken(refreshToken: string) {
    try {
      const response = await api.post('/auth/refresh-token', { refreshToken });
      const { tokens } = response.data.data;
      
      // Update stored tokens
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      
      return tokens;
    } catch (error) {
      // If refresh fails, redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      throw error;
    }
  },
};

export default authService;
