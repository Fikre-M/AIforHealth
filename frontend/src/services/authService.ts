// src/services/authService.ts
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
} from "@/types/auth";
import apiAdapter from "./apiAdapter";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiAdapter.auth.login(credentials);
      
      // Handle both mock and real API response formats
      const { user, tokens, token, refreshToken } = response;
      const accessToken = tokens?.accessToken || token;
      const refresh = tokens?.refreshToken || refreshToken;

      // Store tokens
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refresh);
      localStorage.setItem("user", JSON.stringify(user));

      return {
        user,
        token: accessToken,
        refreshToken: refresh,
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
        throw new Error(error.message || "Request failed. Please check your connection.");
      }
    }
  },

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiAdapter.auth.register(userData);

      // Handle both mock and real API response formats
      const { user, tokens, token, refreshToken } = response;
      const accessToken = tokens?.accessToken || token;
      const refresh = tokens?.refreshToken || refreshToken;
      
      // Store tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('user', JSON.stringify(user));

      return {
        user,
        token: accessToken,
        refreshToken: refresh,
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
      
      throw new Error(error.message || 'Network error. Please check your connection.');
    }
  },

  async logout(): Promise<void> {
    try {
      await apiAdapter.auth.logout();
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
      await apiAdapter.post("/auth/request-password-reset", { email });
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
      await apiAdapter.post("/auth/reset-password", { token, password: newPassword });
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
      await apiAdapter.put("/auth/change-password", { currentPassword, newPassword });
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error('Current password is incorrect');
      }
      throw error;
    }
  },

  async getProfile(): Promise<User> {
    try {
      return await apiAdapter.auth.getProfile();
    } catch (error) {
      throw error;
    }
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      return await apiAdapter.auth.updateProfile(updates);
    } catch (error) {
      throw error;
    }
  },

  async refreshToken(refreshToken: string) {
    try {
      const response = await apiAdapter.auth.refreshToken(refreshToken);
      const tokens = response.tokens || response;
      
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
