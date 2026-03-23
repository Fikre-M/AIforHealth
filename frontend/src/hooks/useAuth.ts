import { useState, useEffect } from 'react';
import type { LoginCredentials, RegisterData, AuthState, User } from '@/types/auth';
import { authService } from '@/services/authService';

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokenAction: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

type AuthHook = AuthState & AuthActions;

let authState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false,
  isAuthenticated: false,
};

const listeners: Array<(state: AuthState) => void> = [];

function notifyListeners() {
  listeners.forEach((listener) => {
    listener(authState);
  });
}

function updateAuthState(newState: Partial<AuthState>) {
  authState = { ...authState, ...newState };

  if (authState.user && authState.token) {
    localStorage.setItem('user', JSON.stringify(authState.user));
    localStorage.setItem('accessToken', authState.token);
    localStorage.setItem('refreshToken', authState.refreshToken ?? '');
  } else {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  notifyListeners();
}

function initializeAuth() {
  try {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');

    if (storedUser && storedToken) {
      const user = JSON.parse(storedUser) as User;
      authState = {
        user,
        token: storedToken,
        refreshToken: storedRefreshToken,
        isLoading: false,
        isAuthenticated: true,
      };

      authService.getProfile().catch(() => {
        updateAuthState({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      });
    }
  } catch {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

initializeAuth();

export function useAuth(): AuthHook {
  const [state, setState] = useState(authState);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    updateAuthState({ isLoading: true });
    try {
      const response = await authService.login(credentials);
      updateAuthState({
        user: response.user,
        token: response.token,
        refreshToken: response.refreshToken,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      updateAuthState({ isLoading: false });
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    updateAuthState({ isLoading: true });
    try {
      const response = await authService.register(data);
      updateAuthState({
        user: response.user,
        token: response.token,
        refreshToken: response.refreshToken,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      updateAuthState({ isLoading: false });
      throw error;
    }
  };

  const logout = async () => {
    updateAuthState({ isLoading: true });
    try {
      await authService.logout();
    } catch {
      // ignore logout errors, always clear state
    } finally {
      updateAuthState({
        user: null,
        token: null,
        refreshToken: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  const refreshToken = async () => {
    if (!authState.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await authService.refreshToken(authState.refreshToken);
      const tokens = response as { accessToken: string; refreshToken: string };
      updateAuthState({
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      await logout();
      throw error;
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (!authState.user) return;
    updateAuthState({ user: { ...authState.user, ...updates } });
  };

  return {
    ...state,
    login,
    register,
    logout,
    refreshTokenAction: refreshToken,
    updateUser,
  };
}
