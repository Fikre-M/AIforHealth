import { useState, useEffect } from 'react';
import type { LoginCredentials, RegisterData, AuthState } from '@/types/auth';
import { authService } from '@/services/authService';

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokenAction: () => Promise<void>; // Rename to avoid conflict
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
  listeners.forEach(listener => listener(authState));
}

function updateAuthState(newState: Partial<AuthState>) {
  authState = { ...authState, ...newState };
  
  // Persist to localStorage (use same keys as authService)
  if (authState.user && authState.token) {
    localStorage.setItem('user', JSON.stringify(authState.user));
    localStorage.setItem('accessToken', authState.token);
    localStorage.setItem('refreshToken', authState.refreshToken || '');
  } else {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
  
  notifyListeners();
}

// Initialize from localStorage (use same keys as authService)
function initializeAuth() {
  try {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');

    if (storedUser && storedToken) {
      const user = JSON.parse(storedUser);
      authState = {
        user,
        token: storedToken,
        refreshToken: storedRefreshToken,
        isLoading: false,
        isAuthenticated: true,
      };

      // Verify token is still valid by trying to get profile
      authService.getProfile().catch(() => {
        // Token invalid, clear auth state
        updateAuthState({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      });
    }
  } catch (error) {
    console.error('Error initializing auth:', error);
    // Clear invalid data
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

// Initialize on module load
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
      // The authService already returns the correct structure
      updateAuthState({
        user: response.user,
        token: response.token, // authService returns token (which is accessToken)
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
      updateAuthState({
        user: null,
        token: null,
        refreshToken: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      // Even if logout fails, clear local state
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
      updateAuthState({
        token: response.accessToken, // authService returns accessToken and refreshToken
        refreshToken: response.refreshToken,
      });
    } catch (error) {
      // Refresh failed, logout user
      await logout();
      throw error;
    }
  };

  return {
    ...state,
    login,
    register,
    logout,
    refreshTokenAction: refreshToken,
  };
}