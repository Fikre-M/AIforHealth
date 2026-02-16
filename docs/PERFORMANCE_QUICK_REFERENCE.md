# Performance Optimization Quick Reference

## Quick Commands

```bash
# Development
npm run dev                    # Start dev server

# Build & Preview
npm run build                  # Production build
npm run preview                # Preview production build
ANALYZE=true npm run build     # Build with bundle analysis

# Performance Testing
npm run lighthouse             # Run Lighthouse CI
npm run perf:budget            # Check performance budgets
npm run perf:analyze           # Analyze bundle size

# Type Checking
npm run type-check             # TypeScript type checking
```

## Import Statements

```typescript
// Performance utilities
import {
  initWebVitals,
  observeLongTasks,
  observeResourceTiming,
  debounce,
  throttle,
  lazyLoadImages,
  prefetchResource,
  preloadResource,
  getPerformanceMetrics,
  logPerformanceMetrics,
  isLowEndDevice,
  getAdaptiveLoadingStrategy,
} from '@/utils/performance';

// Performance monitoring component
import { PerformanceMonitor } from '@/components/PerformanceMonitor';

// Loading spinner
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
```

## Common Patterns

### 1. Lazy Loading Routes

```typescript
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('@/features/dashboard'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Dashboard />
    </Suspense>
  );
}
```

### 2. Debounce Search

```typescript
import { debounce } from '@/utils/performance';

const handleSearch = debounce((query: string) => {
  // API call
  searchAPI(query);
}, 300);
```

### 3. Throttle Scroll

```typescript
import { throttle } from '@/utils/performance';

const handleScroll = throttle(() => {
  // Scroll logic
  updateScrollPosition();
}, 100);
```

### 4. Lazy Load Images

```typescript
import { lazyLoadImages } from '@/utils/performance';

useEffect(() => {
  lazyLoadImages();
}, []);

// HTML
<img data-src="/image.jpg" alt="..." className="lazy" />
```

### 5. Prefetch Next Page

```typescript
import { prefetchResource } from '@/utils/performance';

// On hover
<Link 
  to="/dashboard"
  onMouseEnter={() => prefetchResource('/api/dashboard', 'fetch')}
>
  Dashboard
</Link>
```

### 6. Adaptive Loading

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

### 7. Performance Monitoring

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

### 8. React.memo

```typescript
import { memo } from 'react';

const ExpensiveComponent = memo(({ data }) => {
  // Component logic
  return <div>{data}</div>;
});
```

### 9. useMemo

```typescript
import { useMemo } from 'react';

const sortedData = useMemo(() => {
  return data.sort((a, b) => a.value - b.value);
}, [data]);
```

### 10. useCallback

```typescript
import { useCallback } from 'react';

const handleClick = useCallback(() => {
  // Click logic
}, [dependency]);
```

## Web Vitals Targets

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP | ≤ 2.5s | ≤ 4s | > 4s |
| FID | ≤ 100ms | ≤ 300ms | > 300ms |
| CLS | ≤ 0.1 | ≤ 0.25 | > 0.25 |
| FCP | ≤ 1.8s | ≤ 3s | > 3s |
| TTFB | ≤ 800ms | ≤ 1.8s | > 1.8s |
| INP | ≤ 200ms | ≤ 500ms | > 500ms |

## Performance Budgets

### Timing Budgets
- FCP: 1.8s (±200ms)
- LCP: 2.5s (±500ms)
- CLS: 0.1 (±0.05)
- TBT: 200ms (±100ms)
- SI: 3.4s (±600ms)
- TTI: 3.8s (±700ms)

### Size Budgets
- JavaScript: 300KB (±50KB)
- CSS: 50KB (±10KB)
- Images: 200KB (±50KB)
- Fonts: 100KB (±20KB)
- Total: 700KB (±100KB)

### Count Budgets
- Scripts: 15 (±5)
- Stylesheets: 5 (±2)
- Images: 20 (±5)
- Fonts: 4 (±1)
- Total: 50 (±10)

## Optimization Checklist

### Code
- [ ] Implement lazy loading
- [ ] Use React.memo for expensive components
- [ ] Implement code splitting
- [ ] Remove unused code
- [ ] Minimize re-renders
- [ ] Use production build

### Images
- [ ] Optimize image sizes
- [ ] Use modern formats (WebP)
- [ ] Implement lazy loading
- [ ] Set width/height attributes
- [ ] Use responsive images
- [ ] Compress images

### CSS
- [ ] Minimize CSS bundle
- [ ] Remove unused CSS
- [ ] Use critical CSS
- [ ] Avoid @import
- [ ] Minify CSS

### JavaScript
- [ ] Code splitting
- [ ] Tree shaking
- [ ] Minimize bundle size
- [ ] Remove console.log
- [ ] Use async/defer
- [ ] Minify JavaScript

### Network
- [ ] Enable compression
- [ ] Implement caching
- [ ] Use CDN
- [ ] Minimize requests
- [ ] Use resource hints
- [ ] HTTP/2 or HTTP/3

## Debugging Performance

### Chrome DevTools

**Performance Tab:**
1. F12 → Performance
2. Click Record
3. Interact with app
4. Stop recording
5. Analyze flame graph

**Lighthouse Tab:**
1. F12 → Lighthouse
2. Select categories
3. Generate report
4. Review recommendations

**Coverage Tab:**
1. Cmd+Shift+P → "Show Coverage"
2. Click Record
3. Interact with app
4. Stop recording
5. Identify unused code

### React DevTools

```typescript
import { Profiler } from 'react';

<Profiler id="Component" onRender={(id, phase, actualDuration) => {
  console.log(`${id} took ${actualDuration}ms`);
}}>
  <Component />
</Profiler>
```

### Console Commands

```javascript
// Get performance metrics
performance.getEntriesByType('navigation')
performance.getEntriesByType('paint')
performance.getEntriesByType('resource')

// Memory usage (Chrome only)
performance.memory

// Clear performance data
performance.clearMarks()
performance.clearMeasures()
```

## Common Issues & Solutions

### Slow Initial Load
**Problem:** Large bundle size
**Solution:** Implement code splitting

### Poor LCP
**Problem:** Large images above fold
**Solution:** Optimize hero images, use preload

### High CLS
**Problem:** Images without dimensions
**Solution:** Set width/height attributes

### Slow Interactions
**Problem:** Long tasks blocking main thread
**Solution:** Use Web Workers, optimize algorithms

### Memory Leaks
**Problem:** Event listeners not cleaned up
**Solution:** Use cleanup in useEffect

## Environment Variables

```bash
# Analytics endpoint
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com/metrics

# Enable performance monitoring
VITE_ENABLE_PERFORMANCE_MONITORING=true

# Sentry DSN
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/lighthouse-ci.yml
- name: Run Lighthouse CI
  run: |
    npm install -g @lhci/cli
    lhci autorun
```

### Performance Checks

```bash
# Check budgets
npm run perf:budget

# Run Lighthouse
npm run lighthouse

# Analyze bundle
ANALYZE=true npm run build
```

## Monitoring in Production

### Web Vitals

```typescript
import { initWebVitals } from '@/utils/performance';

// Send to analytics
initWebVitals();
```

### Error Tracking

```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    new Sentry.BrowserTracing(),
  ],
  tracesSampleRate: 0.1,
});
```

### Custom Metrics

```typescript
// Track custom metric
if (window.gtag) {
  window.gtag('event', 'custom_metric', {
    event_category: 'Performance',
    event_label: 'Dashboard Load',
    value: loadTime,
  });
}
```

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Vite Performance](https://vitejs.dev/guide/performance.html)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)

## Support

For issues or questions:
1. Check documentation: `docs/PERFORMANCE_OPTIMIZATION.md`
2. Run Lighthouse audit
3. Check bundle analysis
4. Review Web Vitals
5. Contact development team
