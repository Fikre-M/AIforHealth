# Performance & Optimization Guide

## Overview
This document describes the comprehensive performance optimization strategy implemented in the AI Healthcare application, including code splitting, lazy loading, Web Vitals monitoring, Lighthouse CI, performance budgets, and optimization techniques.

## Table of Contents
1. [Code Splitting & Lazy Loading](#code-splitting--lazy-loading)
2. [Web Vitals Monitoring](#web-vitals-monitoring)
3. [Performance Budgets](#performance-budgets)
4. [Lighthouse CI](#lighthouse-ci)
5. [Build Optimization](#build-optimization)
6. [Runtime Optimization](#runtime-optimization)
7. [Monitoring & Profiling](#monitoring--profiling)
8. [Best Practices](#best-practices)

---

## Code Splitting & Lazy Loading

### Implementation

**File:** `frontend/src/App.optimized.tsx`

The application uses React's `lazy()` and `Suspense` for route-based code splitting:

```typescript
import { lazy, Suspense } from 'react';

// Eager load critical components (above the fold)
import { LandingPage } from '@/features/landing/components/LandingPage';
import { LoginForm, RegisterForm } from '@/features/auth/components';

// Lazy load non-critical routes
const PatientDashboard = lazy(() => 
  import('@/features/dashboard/components/PatientDashboard')
);
const DoctorDashboard = lazy(() => 
  import('@/features/dashboard/components/DoctorDashboard')
);
// ... more lazy imports
```

### Strategy

**Eager Loading (Immediate):**
- Landing page
- Login/Register forms
- Critical UI components
- Error boundaries

**Lazy Loading (On-Demand):**
- Dashboard components
- Feature pages (appointments, patients, analytics)
- AI features (chat, symptom checker)
- Profile and settings pages

### Benefits

- ✅ Reduced initial bundle size
- ✅ Faster Time to Interactive (TTI)
- ✅ Better First Contentful Paint (FCP)
- ✅ Improved Largest Contentful Paint (LCP)
- ✅ Lower bandwidth usage

### Loading States

```typescript
function RouteLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="large" />
    </div>
  );
}

<Suspense fallback={<RouteLoadingFallback />}>
  <LazyComponent />
</Suspense>
```

---

## Web Vitals Monitoring

### Core Web Vitals

**File:** `frontend/src/utils/performance.ts`

The application monitors all Core Web Vitals:

1. **Largest Contentful Paint (LCP)** - Loading performance
   - Target: < 2.5s (good), < 4s (needs improvement)
   - Measures: When largest content element becomes visible

2. **First Input Delay (FID)** - Interactivity
   - Target: < 100ms (good), < 300ms (needs improvement)
   - Measures: Time from first user interaction to browser response

3. **Cumulative Layout Shift (CLS)** - Visual stability
   - Target: < 0.1 (good), < 0.25 (needs improvement)
   - Measures: Unexpected layout shifts during page load

4. **First Contentful Paint (FCP)** - Perceived load speed
   - Target: < 1.8s (good), < 3s (needs improvement)
   - Measures: When first content appears

5. **Time to First Byte (TTFB)** - Server response time
   - Target: < 800ms (good), < 1.8s (needs improvement)
   - Measures: Time from navigation to first byte received

6. **Interaction to Next Paint (INP)** - Responsiveness
   - Target: < 200ms (good), < 500ms (needs improvement)
   - Measures: Latency of all user interactions

### Implementation

```typescript
import { initWebVitals } from '@/utils/performance';

// Initialize in main.tsx
initWebVitals();
```

### Data Collection

Metrics are automatically sent to:
- Console (development)
- Google Analytics (if configured)
- Custom analytics endpoint (if configured)

```typescript
// Environment variable
VITE_ANALYTICS_ENDPOINT=https://your-analytics-api.com/metrics
```

### Monitoring Component

**File:** `frontend/src/components/PerformanceMonitor.tsx`

```typescript
import { PerformanceMonitor } from '@/components/PerformanceMonitor';

function App() {
  return (
    <>
      <PerformanceMonitor />
      {/* Rest of app */}
    </>
  );
}
```

---

## Performance Budgets

### Budget Configuration

**File:** `frontend/performance-budget.json`

Defines maximum acceptable values for:

**Timing Budgets:**
- First Contentful Paint: 1.8s (±200ms)
- Largest Contentful Paint: 2.5s (±500ms)
- Cumulative Layout Shift: 0.1 (±0.05)
- Total Blocking Time: 200ms (±100ms)
- Speed Index: 3.4s (±600ms)
- Time to Interactive: 3.8s (±700ms)

**Resource Size Budgets:**
- JavaScript: 300KB (±50KB)
- CSS: 50KB (±10KB)
- Images: 200KB (±50KB)
- Fonts: 100KB (±20KB)
- Total: 700KB (±100KB)

**Resource Count Budgets:**
- Scripts: 15 (±5)
- Stylesheets: 5 (±2)
- Images: 20 (±5)
- Fonts: 4 (±1)
- Third-party: 10 (±3)
- Total: 50 (±10)

### Enforcement

Budgets are enforced via:
1. Lighthouse CI (automated)
2. Build warnings (Vite)
3. CI/CD pipeline checks

### Monitoring

```bash
# Check current bundle sizes
npm run build

# Analyze bundle
ANALYZE=true npm run build
```

---

## Lighthouse CI

### Configuration

**File:** `frontend/lighthouserc.json`

Lighthouse CI runs on:
- Every pull request
- Every push to main branch
- Manual trigger

### Assertions

**Performance Targets:**
- Performance score: ≥ 90
- Accessibility score: ≥ 90
- Best Practices score: ≥ 90
- SEO score: ≥ 90

**Metric Targets:**
- FCP: ≤ 1.8s
- LCP: ≤ 2.5s
- CLS: ≤ 0.1
- TBT: ≤ 200ms
- Speed Index: ≤ 3.4s
- TTI: ≤ 3.8s

### GitHub Actions Workflow

**File:** `.github/workflows/lighthouse-ci.yml`

Automatically:
1. Builds the application
2. Runs Lighthouse tests
3. Uploads results as artifacts
4. Comments on PR with scores
5. Fails if budgets exceeded

### Local Testing

```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Build and test
cd frontend
npm run build
npm run preview

# Run Lighthouse CI
lhci autorun
```

### Viewing Results

Results are available:
- In GitHub Actions artifacts
- In PR comments
- At temporary public storage (if configured)

---

## Build Optimization

### Vite Configuration

**File:** `frontend/vite.config.optimized.ts`

**Optimizations:**

1. **Code Splitting**
   - Manual chunks for vendors
   - Feature-based chunks
   - Better caching strategy

2. **Minification**
   - Terser for JavaScript
   - CSS minification
   - Remove console.log in production

3. **Compression**
   - Gzip compression
   - Brotli compression
   - Pre-compressed assets

4. **Asset Optimization**
   - Organized asset structure
   - Hashed filenames for caching
   - Optimized chunk sizes

5. **Dependency Optimization**
   - Pre-bundled dependencies
   - Tree shaking
   - Dead code elimination

### Build Commands

```bash
# Development build
npm run dev

# Production build
npm run build

# Build with analysis
ANALYZE=true npm run build

# Preview production build
npm run preview
```

### Bundle Analysis

```bash
# Generate bundle visualization
ANALYZE=true npm run build

# Opens dist/stats.html with:
# - Bundle size breakdown
# - Gzip/Brotli sizes
# - Module dependencies
# - Chunk analysis
```

---

## Runtime Optimization

### Performance Utilities

**File:** `frontend/src/utils/performance.ts`

**Available Functions:**

1. **Debounce** - Limit function execution rate
```typescript
import { debounce } from '@/utils/performance';

const handleSearch = debounce((query: string) => {
  // Search logic
}, 300);
```

2. **Throttle** - Ensure minimum time between executions
```typescript
import { throttle } from '@/utils/performance';

const handleScroll = throttle(() => {
  // Scroll logic
}, 100);
```

3. **Lazy Load Images** - Load images on demand
```typescript
import { lazyLoadImages } from '@/utils/performance';

// In component
useEffect(() => {
  lazyLoadImages();
}, []);

// In HTML
<img data-src="/path/to/image.jpg" alt="..." className="lazy" />
```

4. **Prefetch Resources** - Load resources in advance
```typescript
import { prefetchResource } from '@/utils/performance';

// Prefetch next page
prefetchResource('/api/appointments', 'fetch');
```

5. **Preload Critical Resources** - Load critical resources early
```typescript
import { preloadResource } from '@/utils/performance';

// Preload font
preloadResource('/fonts/inter.woff2', 'font');
```

### Adaptive Loading

Automatically adjusts loading strategy based on:
- Device capabilities
- Network conditions
- User preferences

```typescript
import { getAdaptiveLoadingStrategy } from '@/utils/performance';

const strategy = getAdaptiveLoadingStrategy();

if (strategy.shouldLazyLoad) {
  // Use lazy loading
}

if (strategy.enableAnimations) {
  // Enable animations
}
```

### Long Task Detection

Automatically detects and logs tasks > 50ms:

```typescript
import { observeLongTasks } from '@/utils/performance';

observeLongTasks();
```

### Resource Timing

Monitors slow resources (> 1s):

```typescript
import { observeResourceTiming } from '@/utils/performance';

observeResourceTiming();
```

---

## Monitoring & Profiling

### Performance Metrics

Get current performance metrics:

```typescript
import { getPerformanceMetrics, logPerformanceMetrics } from '@/utils/performance';

// Get metrics object
const metrics = getPerformanceMetrics();

// Log to console
logPerformanceMetrics();
```

### React DevTools Profiler

```typescript
import { Profiler } from 'react';

<Profiler id="Dashboard" onRender={(id, phase, actualDuration) => {
  console.log(`${id} (${phase}) took ${actualDuration}ms`);
}}>
  <Dashboard />
</Profiler>
```

### Chrome DevTools

**Performance Tab:**
1. Open DevTools (F12)
2. Go to Performance tab
3. Click Record
4. Interact with app
5. Stop recording
6. Analyze flame graph

**Lighthouse Tab:**
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Select categories
4. Click "Generate report"
5. Review recommendations

**Coverage Tab:**
1. Open DevTools (F12)
2. Go to Coverage tab (Cmd+Shift+P → "Show Coverage")
3. Click Record
4. Interact with app
5. Stop recording
6. Identify unused code

### Network Throttling

Test on slow connections:
1. Open DevTools
2. Go to Network tab
3. Select throttling profile (Fast 3G, Slow 3G, etc.)
4. Test application

---

## Best Practices

### Code Optimization

✅ **DO:**
- Use React.memo for expensive components
- Implement virtualization for long lists
- Debounce/throttle event handlers
- Use Web Workers for heavy computations
- Lazy load images and components
- Minimize re-renders
- Use production builds

❌ **DON'T:**
- Inline large objects in JSX
- Create functions in render
- Use index as key in lists
- Ignore console warnings
- Skip code splitting
- Load all data upfront

### Image Optimization

✅ **DO:**
- Use modern formats (WebP, AVIF)
- Implement lazy loading
- Use responsive images
- Compress images
- Use CDN for images
- Set width/height attributes
- Use appropriate sizes

❌ **DON'T:**
- Use unoptimized images
- Load images above the fold lazily
- Use large images for thumbnails
- Forget alt attributes
- Use images for text

### CSS Optimization

✅ **DO:**
- Use CSS-in-JS or CSS modules
- Minimize CSS bundle size
- Use critical CSS
- Avoid @import
- Use CSS containment
- Minimize specificity
- Use CSS Grid/Flexbox

❌ **DON'T:**
- Include unused CSS
- Use inline styles everywhere
- Create deep selector nesting
- Use !important excessively
- Forget to minify CSS

### JavaScript Optimization

✅ **DO:**
- Use code splitting
- Tree shake dependencies
- Minimize bundle size
- Use async/defer for scripts
- Implement service workers
- Use modern JavaScript
- Optimize loops and algorithms

❌ **DON'T:**
- Include unused dependencies
- Use synchronous operations
- Block main thread
- Ignore bundle size
- Use outdated polyfills

### Network Optimization

✅ **DO:**
- Use HTTP/2 or HTTP/3
- Enable compression (Gzip/Brotli)
- Implement caching strategies
- Use CDN for static assets
- Minimize requests
- Use resource hints (preload, prefetch)
- Implement service workers

❌ **DON'T:**
- Make unnecessary requests
- Ignore caching headers
- Load resources synchronously
- Use blocking resources
- Forget about mobile networks

---

## Performance Checklist

### Before Deployment

- [ ] Run Lighthouse audit
- [ ] Check bundle sizes
- [ ] Test on slow networks
- [ ] Test on low-end devices
- [ ] Verify lazy loading works
- [ ] Check Web Vitals scores
- [ ] Review performance budgets
- [ ] Test with React DevTools Profiler
- [ ] Verify images are optimized
- [ ] Check for unused code
- [ ] Test accessibility
- [ ] Verify SEO optimization

### Continuous Monitoring

- [ ] Monitor Web Vitals in production
- [ ] Track bundle size over time
- [ ] Review Lighthouse CI results
- [ ] Monitor error rates
- [ ] Track user experience metrics
- [ ] Review performance budgets
- [ ] Analyze user feedback
- [ ] Monitor server response times

---

## Troubleshooting

### Slow Initial Load

**Possible causes:**
- Large bundle size
- Unoptimized images
- Blocking resources
- Slow server response

**Solutions:**
- Implement code splitting
- Optimize images
- Use async/defer for scripts
- Enable compression
- Use CDN

### Poor LCP Score

**Possible causes:**
- Large images above fold
- Slow server response
- Render-blocking resources
- Client-side rendering

**Solutions:**
- Optimize hero images
- Use preload for critical resources
- Implement SSR/SSG
- Optimize critical rendering path

### High CLS Score

**Possible causes:**
- Images without dimensions
- Dynamic content injection
- Web fonts causing FOIT/FOUT
- Ads without reserved space

**Solutions:**
- Set width/height on images
- Reserve space for dynamic content
- Use font-display: swap
- Reserve space for ads

### Slow Interactions

**Possible causes:**
- Long tasks blocking main thread
- Heavy JavaScript execution
- Unoptimized event handlers
- Memory leaks

**Solutions:**
- Use Web Workers
- Debounce/throttle handlers
- Optimize algorithms
- Fix memory leaks

---

## Resources

### Tools

- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Bundle Analyzer](https://www.npmjs.com/package/rollup-plugin-visualizer)

### Documentation

- [Web Vitals](https://web.dev/vitals/)
- [Performance Best Practices](https://web.dev/fast/)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Vite Performance](https://vitejs.dev/guide/performance.html)

### Monitoring Services

- [Google Analytics](https://analytics.google.com/)
- [Sentry Performance](https://sentry.io/for/performance/)
- [New Relic](https://newrelic.com/)
- [Datadog RUM](https://www.datadoghq.com/product/real-user-monitoring/)

---

## Summary

The application now has:
- ✅ Code splitting and lazy loading
- ✅ Web Vitals monitoring
- ✅ Performance budgets
- ✅ Lighthouse CI integration
- ✅ Build optimization
- ✅ Runtime optimization utilities
- ✅ Comprehensive monitoring
- ✅ Detailed documentation

This provides production-ready performance optimization for the AI Healthcare application.
