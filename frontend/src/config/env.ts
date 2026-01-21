// Frontend environment configuration
interface AppConfig {
  // API Configuration
  apiBaseUrl: string;
  
  // App Configuration
  appName: string;
  appVersion: string;
  
  // Feature Flags
  features: {
    aiChat: boolean;
    notifications: boolean;
    symptomChecker: boolean;
    appointmentBooking: boolean;
    darkMode: boolean;
  };
  
  // Third-party Services
  services: {
    openaiApiKey?: string;
    sentryDsn?: string;
    googleAnalyticsId?: string;
  };
  
  // Environment
  isDevelopment: boolean;
  isProduction: boolean;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key] || defaultValue;
  if (!value && !defaultValue) {
    console.warn(`Environment variable ${key} is not set`);
  }
  return value || '';
};

const getBooleanEnvVar = (key: string, defaultValue = false): boolean => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
};

export const config: AppConfig = {
  // API Configuration
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:5000/api/v1'),
  
  // App Configuration
  appName: getEnvVar('VITE_APP_NAME', 'AI for Health'),
  appVersion: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  
  // Feature Flags
  features: {
    aiChat: getBooleanEnvVar('VITE_ENABLE_AI_CHAT', true),
    notifications: getBooleanEnvVar('VITE_ENABLE_NOTIFICATIONS', true),
    symptomChecker: getBooleanEnvVar('VITE_ENABLE_SYMPTOM_CHECKER', true),
    appointmentBooking: getBooleanEnvVar('VITE_ENABLE_APPOINTMENT_BOOKING', true),
    darkMode: getBooleanEnvVar('VITE_ENABLE_DARK_MODE', true),
  },
  
  // Third-party Services
  services: {
    openaiApiKey: getEnvVar('VITE_OPENAI_API_KEY'),
    sentryDsn: getEnvVar('VITE_SENTRY_DSN'),
    googleAnalyticsId: getEnvVar('VITE_GA_ID'),
  },
  
  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

// Validate configuration
export const validateConfig = (): void => {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Validate required configuration
  if (!config.apiBaseUrl) {
    errors.push('API base URL is required');
  }

  // Validate production requirements
  if (config.isProduction) {
    if (!config.services.sentryDsn) {
      warnings.push('Sentry DSN not configured - error monitoring will be disabled');
    }
    if (!config.services.googleAnalyticsId) {
      warnings.push('Google Analytics ID not configured - analytics will be disabled');
    }
  }

  // Log warnings and errors
  if (warnings.length > 0) {
    console.warn('⚠️  Frontend configuration warnings:');
    warnings.forEach(warning => console.warn(`   ${warning}`));
  }

  if (errors.length > 0) {
    console.error('❌ Frontend configuration errors:');
    errors.forEach(error => console.error(`   ${error}`));
    throw new Error('Frontend configuration validation failed');
  }

  if (config.isDevelopment) {
    console.log('✅ Frontend configuration validated successfully');
    console.log('🔧 Development mode enabled');
    console.log(`📡 API Base URL: ${config.apiBaseUrl}`);
  }
};

export default config;