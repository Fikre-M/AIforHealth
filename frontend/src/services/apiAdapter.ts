// API Adapter - switches between real and mock APIs based on environment
import { config } from '@/config/env';
import api from './api';
import { mockApi } from './mockApi';

// Create a unified API interface
export const apiAdapter = {
  // Auth methods
  auth: {
    login: config.useMockApi ? mockApi.auth.login : (credentials: any) => 
      api.post('/auth/login', credentials).then(res => res.data.data),
    
    register: config.useMockApi ? mockApi.auth.register : (data: any) => 
      api.post('/auth/register', data).then(res => res.data.data),
    
    logout: config.useMockApi ? mockApi.auth.logout : () => 
      api.post('/auth/logout').then(res => res.data),
    
    refreshToken: config.useMockApi ? mockApi.auth.refreshToken : (refreshToken: string) => 
      api.post('/auth/refresh-token', { refreshToken }).then(res => res.data),
    
    getProfile: config.useMockApi ? mockApi.auth.getProfile : () => 
      api.get('/auth/profile').then(res => res.data.data.user),
    
    updateProfile: config.useMockApi ? mockApi.auth.updateProfile : (data: any) => 
      api.put('/auth/profile', data).then(res => res.data.data.user)
  },

  // Appointment methods
  appointments: {
    getAppointments: config.useMockApi ? mockApi.appointments.getAppointments : (params?: any) => 
      api.get('/appointments', { params }).then(res => {
        // Handle different response formats
        return res.data.data || res.data;
      }),
    
    getAppointment: config.useMockApi ? mockApi.appointments.getAppointment : (id: string) => 
      api.get(`/appointments/${id}`).then(res => {
        // Handle different response formats
        const data = res.data.data || res.data;
        // If data is wrapped in appointment property, unwrap it
        return data.appointment || data;
      }),
    
    createAppointment: config.useMockApi ? mockApi.appointments.createAppointment : (data: any) => 
      api.post('/appointments', data).then(res => {
        // Return the full response to preserve confirmationNumber
        return res.data.data || res.data;
      }),
    
    updateAppointment: config.useMockApi ? mockApi.appointments.updateAppointment : (id: string, data: any) => 
      api.put(`/appointments/${id}`, data).then(res => res.data.data || res.data),
    
    cancelAppointment: config.useMockApi ? mockApi.appointments.cancelAppointment : (id: string) => 
      api.delete(`/appointments/${id}`).then(res => res.data.data || res.data)
  },

  // Notification methods
  notifications: {
    getNotifications: config.useMockApi ? mockApi.notifications.getNotifications : () => 
      api.get('/notifications').then(res => res.data.data),
    
    markAsRead: config.useMockApi ? mockApi.notifications.markAsRead : (id: string) => 
      api.put(`/notifications/${id}/read`).then(res => res.data.data),
    
    markAllAsRead: config.useMockApi ? mockApi.notifications.markAllAsRead : () => 
      api.put('/notifications/mark-all-read').then(res => res.data.data),
    
    deleteNotification: config.useMockApi ? mockApi.notifications.deleteNotification : (id: string) => 
      api.delete(`/notifications/${id}`).then(res => res.data)
  },

  // Generic HTTP methods
  get: config.useMockApi ? mockApi.get : (url: string, params?: any) => 
    api.get(url, { params }).then(res => res.data),
  
  post: config.useMockApi ? mockApi.post : (url: string, data?: any) => 
    api.post(url, data).then(res => res.data),
  
  put: config.useMockApi ? mockApi.put : (url: string, data?: any) => 
    api.put(url, data).then(res => res.data),
  
  patch: config.useMockApi ? mockApi.patch : (url: string, data?: any) => 
    api.patch(url, data).then(res => res.data),
  
  delete: config.useMockApi ? mockApi.delete : (url: string) => 
    api.delete(url).then(res => res.data)
};

// Log which API mode is being used
console.log(`🔧 API Mode: ${config.useMockApi ? 'MOCK' : 'REAL'} API`);

export default apiAdapter;