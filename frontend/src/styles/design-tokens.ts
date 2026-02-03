// Design System Tokens for AI for Health
// This file defines consistent colors, typography, spacing, and other design tokens

export const designTokens = {
  // Color Palette
  colors: {
    // Primary Brand Colors
    primary: {
      50: '#eff6ff',
      100: '#dbeafe', 
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Main primary
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    
    // Medical/Health Colors
    medical: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9', // Main medical
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    
    // Success Colors
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e', // Main success
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    
    // Warning Colors
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b', // Main warning
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    
    // Error/Danger Colors
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444', // Main error
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    
    // Neutral Colors
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    }
  },
  
  // Typography Scale
  typography: {
    // Font Sizes
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
    },
    
    // Font Weights
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    
    // Line Heights
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    }
  },
  
  // Spacing Scale
  spacing: {
    0: '0',
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    8: '2rem',     // 32px
    10: '2.5rem',  // 40px
    12: '3rem',    // 48px
    16: '4rem',    // 64px
    20: '5rem',    // 80px
    24: '6rem',    // 96px
  },
  
  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    full: '9999px',
  },
  
  // Shadows
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  }
};

// Component-specific design tokens
export const componentTokens = {
  // Card styling
  card: {
    padding: {
      sm: designTokens.spacing[3],
      md: designTokens.spacing[4],
      lg: designTokens.spacing[6],
    },
    borderRadius: designTokens.borderRadius.lg,
    shadow: designTokens.boxShadow.sm,
    hoverShadow: designTokens.boxShadow.md,
  },
  
  // Button styling
  button: {
    borderRadius: designTokens.borderRadius.md,
    fontSize: {
      sm: designTokens.typography.fontSize.sm,
      md: designTokens.typography.fontSize.sm,
      lg: designTokens.typography.fontSize.base,
    },
    padding: {
      sm: `${designTokens.spacing[2]} ${designTokens.spacing[3]}`,
      md: `${designTokens.spacing[2]} ${designTokens.spacing[4]}`,
      lg: `${designTokens.spacing[3]} ${designTokens.spacing[6]}`,
    },
    minHeight: {
      sm: '32px',
      md: '40px',
      lg: '48px',
    }
  },
  
  // Dashboard widget styling
  widget: {
    title: {
      fontSize: designTokens.typography.fontSize.lg,
      fontWeight: designTokens.typography.fontWeight.semibold,
      color: designTokens.colors.gray[900],
    },
    subtitle: {
      fontSize: designTokens.typography.fontSize.sm,
      fontWeight: designTokens.typography.fontWeight.normal,
      color: designTokens.colors.gray[600],
    },
    value: {
      fontSize: designTokens.typography.fontSize['2xl'],
      fontWeight: designTokens.typography.fontWeight.bold,
      color: designTokens.colors.gray[900],
    }
  }
};

// Utility functions for consistent styling
export const getVariantColors = (variant: 'primary' | 'success' | 'warning' | 'error' | 'default') => {
  switch (variant) {
    case 'primary':
      return {
        bg: designTokens.colors.primary[100],
        text: designTokens.colors.primary[700],
        darkBg: designTokens.colors.primary[900] + '30', // 30% opacity
        darkText: designTokens.colors.primary[400],
      };
    case 'success':
      return {
        bg: designTokens.colors.success[100],
        text: designTokens.colors.success[700],
        darkBg: designTokens.colors.success[900] + '30',
        darkText: designTokens.colors.success[400],
      };
    case 'warning':
      return {
        bg: designTokens.colors.warning[100],
        text: designTokens.colors.warning[700],
        darkBg: designTokens.colors.warning[900] + '30',
        darkText: designTokens.colors.warning[400],
      };
    case 'error':
      return {
        bg: designTokens.colors.error[100],
        text: designTokens.colors.error[700],
        darkBg: designTokens.colors.error[900] + '30',
        darkText: designTokens.colors.error[400],
      };
    default:
      return {
        bg: designTokens.colors.gray[100],
        text: designTokens.colors.gray[700],
        darkBg: designTokens.colors.gray[800],
        darkText: designTokens.colors.gray[400],
      };
  }
};