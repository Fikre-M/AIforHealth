/**
 * Performance monitoring and optimization utilities
 */

import { onCLS, onFID, onFCP, onLCP, onTTFB, onINP, Metric } from 'web-vitals';

// Web Vitals thresholds (Google's recommended values)
export const WEB_VITALS_THRESHOLDS = {
  // Largest Contentful Paint (LCP) - measures loading performance
  LCP: {
    good: 2500,      // <= 2.5s
    needsImprovement: 4000, // <= 4s
  },
  // First Input Delay (FID) - measures interactivity
  FID: {
    good: 100,       // <= 100ms
    needsImprovement: 300,  // <= 300ms
  },
  // Cumulative Layout Shift (CLS) - measures visual stability
  CLS: {
    good: 0.1,       // <= 0.1
    needsImprovement: 0.25, // <= 0.25
  },
  // First Contentful Paint (FCP) - measures perceived load speed
  FCP: {
    good: 1800,      // <= 1.8s
    needsImprovement: 3000, // <= 3s
  },
  // Time to First Byte (TTFB) - measures server response time
  TTFB: {
    good: 800,       // <= 800ms
    needsImprovement: 1800, // <= 1.8s
  },
  // Interaction to Next Paint (INP) - measures responsiveness
  INP: {
    good: 200,       // <= 200ms
    needsImprovement: 500,  // <= 500ms
  },
};

/**
 * Get rating for a metric value
 */
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = WEB_VITALS_THRESHOLDS[name as keyof typeof WEB_VITALS_THRESHOLDS];
  if (!thresholds) return 'good';
  
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * Send metric to analytics
 */
function sendToAnalytics(metric: Metric) {
  const { name, value, rating, delta, id } = metric;
  
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(`[Web Vitals] ${name}:`, {
      value: Math.round(value),
      rating,
      delta: Math.round(delta),
      id,
    });
  }

  // Send to analytics service (Google Analytics, Sentry, etc.)
  if (window.gtag) {
    window.gtag('event', name, {
      event_category: 'Web Vitals',
      event_label: id,
      value: Math.round(value),
      metric_rating: rating,
      non_interaction: true,
    });
  }

  // Send to custom analytics endpoint
  if (import.meta.env.VITE_ANALYTICS_ENDPOINT) {
    fetch(import.meta.env.VITE_ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric: name,
        value: Math.round(value),
        rating,
        delta: Math.round(delta),
        id,
        url: window.location.href,
        timestamp: Date.now(),
      }),
      keepalive: true,
    }).catch(console.error);
  }
}

/**
 * Initialize Web Vitals monitoring
 */
export function initWebVitals() {
  // Largest Contentful Paint
  onLCP(sendToAnalytics);
  
  // First Input Delay
  onFID(sendToAnalytics);
  
  // Cumulative Layout Shift
  onCLS(sendToAnalytics);
  
  // First Contentful Paint
  onFCP(sendToAnalytics);
  
  // Time to First Byte
  onTTFB(sendToAnalytics);
  
  // Interaction to Next Paint
  onINP(sendToAnalytics);
}

/**
 * Performance observer for long tasks
 */
export function observeLongTasks() {
  if (!('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) { // Tasks longer than 50ms
          console.warn('[Performance] Long task detected:', {
            duration: Math.round(entry.duration),
            startTime: Math.round(entry.startTime),
            name: entry.name,
          });

          // Send to analytics
          if (window.gtag) {
            window.gtag('event', 'long_task', {
              event_category: 'Performance',
              event_label: entry.name,
              value: Math.round(entry.duration),
              non_interaction: true,
            });
          }
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
  } catch (error) {
    console.error('Failed to observe long tasks:', error);
  }
}

/**
 * Performance observer for resource timing
 */
export function observeResourceTiming() {
  if (!('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resource = entry as PerformanceResourceTiming;
        
        // Log slow resources (> 1s)
        if (resource.duration > 1000) {
          console.warn('[Performance] Slow resource:', {
            name: resource.name,
            duration: Math.round(resource.duration),
            size: resource.transferSize,
            type: resource.initiatorType,
          });
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });
  } catch (error) {
    console.error('Failed to observe resource timing:', error);
  }
}

/**
 * Measure component render time
 */
export function measureRender(componentName: string, callback: () => void) {
  const startTime = performance.now();
  callback();
  const endTime = performance.now();
  const duration = endTime - startTime;

  if (duration > 16) { // Longer than one frame (60fps)
    console.warn(`[Performance] Slow render: ${componentName}`, {
      duration: Math.round(duration),
    });
  }

  return duration;
}

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Lazy load images with Intersection Observer
 */
export function lazyLoadImages() {
  if (!('IntersectionObserver' in window)) {
    // Fallback for browsers without IntersectionObserver
    document.querySelectorAll('img[data-src]').forEach((img) => {
      const imgElement = img as HTMLImageElement;
      imgElement.src = imgElement.dataset.src || '';
    });
    return;
  }

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        img.src = img.dataset.src || '';
        img.classList.remove('lazy');
        imageObserver.unobserve(img);
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach((img) => {
    imageObserver.observe(img);
  });
}

/**
 * Prefetch resources
 */
export function prefetchResource(url: string, as: 'script' | 'style' | 'image' | 'fetch' = 'fetch') {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = as;
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Preload critical resources
 */
export function preloadResource(url: string, as: 'script' | 'style' | 'image' | 'font' = 'script') {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = as;
  link.href = url;
  if (as === 'font') {
    link.crossOrigin = 'anonymous';
  }
  document.head.appendChild(link);
}

/**
 * Get performance metrics
 */
export function getPerformanceMetrics() {
  if (!window.performance) return null;

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');

  return {
    // Navigation timing
    dns: navigation ? Math.round(navigation.domainLookupEnd - navigation.domainLookupStart) : 0,
    tcp: navigation ? Math.round(navigation.connectEnd - navigation.connectStart) : 0,
    ttfb: navigation ? Math.round(navigation.responseStart - navigation.requestStart) : 0,
    download: navigation ? Math.round(navigation.responseEnd - navigation.responseStart) : 0,
    domInteractive: navigation ? Math.round(navigation.domInteractive - navigation.fetchStart) : 0,
    domComplete: navigation ? Math.round(navigation.domComplete - navigation.fetchStart) : 0,
    loadComplete: navigation ? Math.round(navigation.loadEventEnd - navigation.fetchStart) : 0,
    
    // Paint timing
    fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
    
    // Memory (if available)
    memory: (performance as any).memory ? {
      usedJSHeapSize: Math.round((performance as any).memory.usedJSHeapSize / 1048576), // MB
      totalJSHeapSize: Math.round((performance as any).memory.totalJSHeapSize / 1048576), // MB
      jsHeapSizeLimit: Math.round((performance as any).memory.jsHeapSizeLimit / 1048576), // MB
    } : null,
  };
}

/**
 * Log performance metrics to console
 */
export function logPerformanceMetrics() {
  const metrics = getPerformanceMetrics();
  if (!metrics) return;

  console.group('[Performance Metrics]');
  console.log('DNS Lookup:', `${metrics.dns}ms`);
  console.log('TCP Connection:', `${metrics.tcp}ms`);
  console.log('Time to First Byte:', `${metrics.ttfb}ms`);
  console.log('Download:', `${metrics.download}ms`);
  console.log('DOM Interactive:', `${metrics.domInteractive}ms`);
  console.log('DOM Complete:', `${metrics.domComplete}ms`);
  console.log('Load Complete:', `${metrics.loadComplete}ms`);
  console.log('First Contentful Paint:', `${Math.round(metrics.fcp)}ms`);
  if (metrics.memory) {
    console.log('Memory Usage:', `${metrics.memory.usedJSHeapSize}MB / ${metrics.memory.jsHeapSizeLimit}MB`);
  }
  console.groupEnd();
}

/**
 * Check if device is low-end
 */
export function isLowEndDevice(): boolean {
  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return true;
  }

  // Check for save-data header
  if ('connection' in navigator && (navigator as any).connection?.saveData) {
    return true;
  }

  // Check device memory (if available)
  if ('deviceMemory' in navigator && (navigator as any).deviceMemory < 4) {
    return true;
  }

  // Check hardware concurrency
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
    return true;
  }

  return false;
}

/**
 * Adaptive loading based on device capabilities
 */
export function getAdaptiveLoadingStrategy() {
  const isLowEnd = isLowEndDevice();
  const connection = (navigator as any).connection;
  const effectiveType = connection?.effectiveType || '4g';

  return {
    shouldLazyLoad: isLowEnd || effectiveType !== '4g',
    shouldPrefetch: !isLowEnd && effectiveType === '4g',
    imageQuality: isLowEnd ? 'low' : effectiveType === '4g' ? 'high' : 'medium',
    enableAnimations: !isLowEnd,
    chunkSize: isLowEnd ? 'small' : 'large',
  };
}

// Type augmentation for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default {
  initWebVitals,
  observeLongTasks,
  observeResourceTiming,
  measureRender,
  debounce,
  throttle,
  lazyLoadImages,
  prefetchResource,
  preloadResource,
  getPerformanceMetrics,
  logPerformanceMetrics,
  isLowEndDevice,
  getAdaptiveLoadingStrategy,
};
