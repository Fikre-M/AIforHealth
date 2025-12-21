export const config = {
  app: {
    name: 'AIforHealth',
    version: '1.0.0',
    description: 'Next-generation AI Healthcare & Medical Appointment System',
  },
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    timeout: 10000,
  },
  features: {
    aiChat: true,
    notifications: true,
    appointments: true,
  },
  theme: {
    primaryColor: '#0ea5e9',
    darkMode: false,
  },
} as const;

export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;