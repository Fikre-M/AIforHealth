import { useState, useEffect } from 'react';
import type { User } from '@/types';
import { api } from '@/services/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
}

let authState: AuthState = {
  user: null,
  isLoading: false,
};

const listeners: Array<(state: AuthState) => void> = [];

function notifyListeners() {
  listeners.forEach(listener => listener(authState));
}

function updateAuthState(newState: Partial<AuthState>) {
  authState = { ...authState, ...newState };
  notifyListeners();
}

// Initialize from localStorage
const stored = localStorage.getItem('auth-user');
if (stored) {
  authState.user = JSON.parse(stored);
}

export function useAuth() {
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

  useEffect(() => {
    if (state.user) {
      localStorage.setItem('auth-user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('auth-user');
    }
  }, [state.user]);

  const login = async (email: string, password: string) => {
    updateAuthState({ isLoading: true });
    try {
      const userData = await api.login(email, password);
      updateAuthState({ user: userData, isLoading: false });
    } catch (error) {
      updateAuthState({ isLoading: false });
      throw error;
    }
  };

  const register = async (userData: Omit<User, 'id'>) => {
    updateAuthState({ isLoading: true });
    try {
      const newUser = await api.register(userData);
      updateAuthState({ user: newUser, isLoading: false });
    } catch (error) {
      updateAuthState({ isLoading: false });
      throw error;
    }
  };

  const logout = () => {
    updateAuthState({ user: null });
  };

  return {
    user: state.user,
    isLoading: state.isLoading,
    login,
    register,
    logout,
  };
}