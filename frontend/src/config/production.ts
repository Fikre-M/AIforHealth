// Production configuration and constants
export const PRODUCTION_CONFIG = {
  // API Configuration
  API: {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.aiforhealth.com',
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
  },

  // Feature Flags
  FEATURES: {
    AI_ASSISTANT: import.meta.env.VITE_FEATURE_AI_ASSISTANT !== 'false',
    SYMPTOM_CHECKER: import.meta.env.VITE_FEATURE_SYMPTOM_CHECKER !== 'false',
    APPOINTMENT_BOOKING: import.meta.env.VITE_FEATURE_APPOINTMENT_BOOKING !== 'false',
    NOTIFICATIONS: import.meta.env.VITE_FEATURE_NOTIFICATIONS !== 'false',
    DARK_MODE: import.meta.env.VITE_FEATURE_DARK_MODE !== 'false',
    ANALYTICS: import.meta.env.VITE_FEATURE_ANALYTICS !== 'false',
  },

  // UI Configuration
  UI: {
    LOADING_DELAY: 200, // Delay before showing loading states
    SKELETON_MIN_DURATION: 500, // Minimum time to show skeletons
    TOAST_DURATION: 5000, // Toast notification duration
    DEBOUNCE_DELAY: 300, // Default debounce delay for search
    ANIMATION_DURATION: 200, // Default animation duration
  },

  // Accessibility Configuration
  ACCESSIBILITY: {
    FOCUS_VISIBLE: true,
    HIGH_CONTRAST_SUPPORT: true,
    REDUCED_MOTION_SUPPORT: true,
    SCREEN_READER_ANNOUNCEMENTS: true,
    KEYBOARD_NAVIGATION: true,
  },

  // Error Handling
  ERROR_HANDLING: {
    SHOW_STACK_TRACE: import.meta.env.DEV,
    LOG_ERRORS: true,
    REPORT_ERRORS: import.meta.env.PROD,
    MAX_ERROR_REPORTS_PER_SESSION: 10,
  },

  // Performance
  PERFORMANCE: {
    LAZY_LOADING: true,
    IMAGE_OPTIMIZATION: true,
    BUNDLE_SPLITTING: true,
    PRELOAD_CRITICAL_RESOURCES: true,
  },

  // Security
  SECURITY: {
    CSP_ENABLED: import.meta.env.PROD,
    HTTPS_ONLY: import.meta.env.PROD,
    SECURE_COOKIES: import.meta.env.PROD,
    XSS_PROTECTION: true,
  },

  // Monitoring
  MONITORING: {
    PERFORMANCE_MONITORING: import.meta.env.PROD,
    ERROR_TRACKING: import.meta.env.PROD,
    USER_ANALYTICS: import.meta.env.VITE_ANALYTICS_ENABLED === 'true',
    HEALTH_CHECKS: import.meta.env.PROD,
  },

  // Cache Configuration
  CACHE: {
    API_CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    STATIC_CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
    USER_PREFERENCES_CACHE: 7 * 24 * 60 * 60 * 1000, // 7 days
  },

  // Limits
  LIMITS: {
    MAX_FILE_UPLOAD_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_CONCURRENT_REQUESTS: 6,
    MAX_RETRY_ATTEMPTS: 3,
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  },

  // Third-party Services
  SERVICES: {
    SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
    GOOGLE_ANALYTICS_ID: import.meta.env.VITE_GA_ID,
    HOTJAR_ID: import.meta.env.VITE_HOTJAR_ID,
  },
} as const;

// Environment-specific configurations
export const getEnvironmentConfig = () => {
  const isDev = import.meta.env.DEV;
  const isProd = import.meta.env.PROD;
  const isTest = import.meta.env.MODE === 'test';

  return {
    isDev,
    isProd,
    isTest,
    environment: import.meta.env.MODE,
    
    // Development-specific overrides
    ...(isDev && {
      API: {
        ...PRODUCTION_CONFIG.API,
        BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
        TIMEOUT: 10000, // Shorter timeout for dev
      },
      ERROR_HANDLING: {
        ...PRODUCTION_CONFIG.ERROR_HANDLING,
        SHOW_STACK_TRACE: true,
        REPORT_ERRORS: false,
      },
    }),

    // Test-specific overrides
    ...(isTest && {
      API: {
        ...PRODUCTION_CONFIG.API,
        BASE_URL: 'http://localhost:3001',
        TIMEOUT: 5000,
      },
      UI: {
        ...PRODUCTION_CONFIG.UI,
        LOADING_DELAY: 0, // No delays in tests
        SKELETON_MIN_DURATION: 0,
        ANIMATION_DURATION: 0,
      },
    }),
  };
};

// Feature flag utilities
export const isFeatureEnabled = (feature: keyof typeof PRODUCTION_CONFIG.FEATURES): boolean => {
  return PRODUCTION_CONFIG.FEATURES[feature];
};

// Environment utilities
export const getApiUrl = (endpoint: string): string => {
  const config = getEnvironmentConfig();
  const baseUrl = config.API?.BASE_URL || PRODUCTION_CONFIG.API.BASE_URL;
  return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Performance utilities
export const shouldShowSkeleton = (loadingTime: number): boolean => {
  return loadingTime > PRODUCTION_CONFIG.UI.LOADING_DELAY;
};

// Error reporting utilities
export const shouldReportError = (error: Error): boolean => {
  if (!PRODUCTION_CONFIG.ERROR_HANDLING.REPORT_ERRORS) return false;
  
  // Don't report certain types of errors
  const ignoredErrors = [
    'Network request failed',
    'User cancelled',
    'AbortError',
  ];
  
  return !ignoredErrors.some(ignored => error.message.includes(ignored));
};

// Accessibility utilities
export const getAccessibilityConfig = () => {
  return {
    ...PRODUCTION_CONFIG.ACCESSIBILITY,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    prefersHighContrast: window.matchMedia('(prefers-contrast: high)').matches,
    prefersDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
  };
};

// Cache utilities
export const getCacheKey = (prefix: string, ...parts: string[]): string => {
  return `aiforhealth:${prefix}:${parts.join(':')}`;
};

export const isCacheExpired = (timestamp: number, duration: number): boolean => {
  return Date.now() - timestamp > duration;
};

// Validation utilities
export const validateEnvironment = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check required environment variables
  const requiredVars = [
    'VITE_API_BASE_URL',
  ];
  
  requiredVars.forEach(varName => {
    if (!import.meta.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  });
  
  // Check feature flag consistency
  if (PRODUCTION_CONFIG.FEATURES.AI_ASSISTANT && !import.meta.env.VITE_OPENAI_API_KEY) {
    errors.push('AI Assistant feature enabled but VITE_OPENAI_API_KEY not provided');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Export default configuration
export default PRODUCTION_CONFIG;