import api from './api';

// Create a unified API interface
export const apiAdapter = {
  // Auth methods
  auth: {
    login: (credentials: any) => 
      api.post('/auth/login', credentials).then(res => res.data.data),
    
    register: (data: any) => 
      api.post('/auth/register', data).then(res => res.data.data),
    
    logout: () => 
      api.post('/auth/logout').then(res => res.data),
    
    refreshToken: (refreshToken: string) => 
      api.post('/auth/refresh-token', { refreshToken }).then(res => res.data),
    
    getProfile: () => 
      api.get('/auth/profile').then(res => res.data.data.user),
    
    updateProfile: (data: any) => 
      api.put('/auth/profile', data).then(res => res.data.data.user)
  },

  // Appointment methods
  appointments: {
    getAppointments: (params?: any) => 
      api.get('/appointments', { params }).then(res => {
        // Handle different response formats
        return res.data.data || res.data;
      }),
    
    getAppointment: (id: string) => 
      api.get(`/appointments/${id}`).then(res => {
        // Handle different response formats
        const data = res.data.data || res.data;
        // If data is wrapped in appointment property, unwrap it
        return data.appointment || data;
      }),
    
    createAppointment: (data: any) => 
      api.post('/appointments', data).then(res => {
        // Return the full response to preserve confirmationNumber
        return res.data.data || res.data;
      }),
    
    updateAppointment: (id: string, data: any) => 
      api.put(`/appointments/${id}`, data).then(res => res.data.data || res.data),
    
    cancelAppointment: (id: string) => 
      api.delete(`/appointments/${id}`).then(res => res.data.data || res.data)
  },

  // Notification methods
  notifications: {
    getNotifications: () => 
      api.get('/notifications').then(res => res.data.data),
    
    markAsRead: (id: string) => 
      api.put(`/notifications/${id}/read`).then(res => res.data.data),
    
    markAllAsRead: () => 
      api.put('/notifications/mark-all-read').then(res => res.data.data),
    
    deleteNotification: (id: string) => 
      api.delete(`/notifications/${id}`).then(res => res.data)
  },

  // Generic HTTP methods
  get: (url: string, params?: any) => 
    api.get(url, { params }).then(res => res.data),
  
  post: (url: string, data?: any) => 
    api.post(url, data).then(res => res.data),
  
  put: (url: string, data?: any) => 
    api.put(url, data).then(res => res.data),
  
  patch: (url: string, data?: any) => 
    api.patch(url, data).then(res => res.data),
  
  delete: (url: string) => 
    api.delete(url).then(res => res.data)
};

console.log('🌐 API Mode: Real API (Mock fallbacks removed)');

export default apiAdapter;
