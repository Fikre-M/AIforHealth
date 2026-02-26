import axios from 'axios';
import { config } from '@/config/env';

const API_BASE_URL = config.apiBaseUrl;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/sessions
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token available');

        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });

        const { tokens } = response.data.data; // Backend returns data.data

        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return await api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(
          refreshError instanceof Error ? refreshError : new Error('Token refresh failed')
        );
      }
    }

    return Promise.reject(error instanceof Error ? error : new Error('Request failed'));
  }
);

export default api;
export { api }; // Also export as named export for backward compatibility

// Extend the AxiosInstance interface to include custom methods
declare module 'axios' {
  interface AxiosInstance {
    sendChatMessage(message: string): Promise<any>;
    login(email: string, password: string): Promise<any>;
    register(userData: any): Promise<any>;
  }
}

// Add chat methods to the api instance
api.sendChatMessage = async (message: string) => {
  const response = await api.post('/chat/message', { message });
  return response.data;
};

// Add auth methods to the api instance
api.login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

api.register = async (userData: any) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};
