import { useState, useEffect } from 'react';
import type { User, LoginCredentials, RegisterData, AuthState } from '@/types/auth';
import { authService } from '@/services/authService';

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
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
  
  // Persist to localStorage
  if (authState.user && authState.token) {
    localStorage.setItem('auth-user', JSON.stringify(authState.user));
    localStorage.setItem('auth-token', authState.token);
    localStorage.setItem('auth-refresh-token', authState.refreshToken || '');
  } else {
    localStorage.removeItem('auth-user');
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-refresh-token');
  }
  
  notifyListeners();
}

// Initialize from localStorage
function initializeAuth() {
  try {
    const storedUser = localStorage.getItem('auth-user');
    const storedToken = localStorage.getItem('auth-token');
    const storedRefreshToken = localStorage.getItem('auth-refresh-token');

    if (storedUser && storedToken) {
      const user = JSON.parse(storedUser);
      authState = {
        user,
        token: storedToken,
        refreshToken: storedRefreshToken,
        isLoading: false,
        isAuthenticated: true,
      };

      // Verify token is still valid
      authService.verifyToken(storedToken).catch(() => {
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
    localStorage.removeItem('auth-user');
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-refresh-token');
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
      // Handle the nested tokens structure from the backend
      updateAuthState({
        user: response.user,
        token: response.tokens.access.token,
        refreshToken: response.tokens.refresh.token,
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
        token: response.token,
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
    refreshToken,
  };
}