import { useEffect } from 'react';
import { 
  initWebVitals, 
  observeLongTasks, 
  observeResourceTiming,
  logPerformanceMetrics,
  getAdaptiveLoadingStrategy
} from '@/utils/performance';

/**
 * Performance monitoring component
 * Initializes Web Vitals tracking and performance observers
 */
export function PerformanceMonitor() {
  useEffect(() => {
    // Initialize Web Vitals monitoring
    initWebVitals();

    // Observe long tasks
    observeLongTasks();

    // Observe resource timing
    observeResourceTiming();

    // Log performance metrics in development
    if (import.meta.env.DEV) {
      // Wait for page load to complete
      window.addEventListener('load', () => {
        setTimeout(() => {
          logPerformanceMetrics();
          
          // Log adaptive loading strategy
          const strategy = getAdaptiveLoadingStrategy();
          console.log('[Adaptive Loading]', strategy);
        }, 0);
      });
    }

    // Report performance metrics to analytics on page unload
    const reportMetrics = () => {
      if (navigator.sendBeacon && import.meta.env.VITE_ANALYTICS_ENDPOINT) {
        const metrics = {
          url: window.location.href,
          timestamp: Date.now(),
          performance: window.performance.timing,
        };
        
        navigator.sendBeacon(
          import.meta.env.VITE_ANALYTICS_ENDPOINT,
          JSON.stringify(metrics)
        );
      }
    };

    window.addEventListener('beforeunload', reportMetrics);

    return () => {
      window.removeEventListener('beforeunload', reportMetrics);
    };
  }, []);

  // This component doesn't render anything
  return null;
}
