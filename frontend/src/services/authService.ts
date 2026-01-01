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
      const { user, tokens } = response.data;

      // Store tokens
      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);

      return {
        user,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      console.error("Login failed:", error);
      // Provide more specific error messages
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new Error(error.response.data?.message || "Login failed");
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error("No response from server. Please try again.");
      } else {
        // Something happened in setting up the request
        throw new Error("Request failed. Please check your connection.");
      }
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
    await api.post("/auth/request-password-reset", { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post("/auth/reset-password", { token, newPassword });
  },

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    await api.post("/auth/change-password", { currentPassword, newPassword });
  },

  async getProfile(): Promise<User> {
    const response = await api.get("/auth/profile");
    return response.data.user;
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    const response = await api.put("/auth/profile", updates);
    return response.data.user;
  },
};

export default authService;
