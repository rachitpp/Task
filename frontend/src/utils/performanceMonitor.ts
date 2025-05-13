/**
 * Performance monitoring utilities for tracking frontend performance
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

// Store for performance metrics
const metrics: PerformanceMetric[] = [];
const MAX_METRICS = 100; // Limit stored metrics to prevent memory issues

// Track a performance metric
export const trackMetric = (name: string, value: number): void => {
  metrics.push({
    name,
    value,
    timestamp: Date.now(),
  });

  // Trim metrics array if it gets too large
  if (metrics.length > MAX_METRICS) {
    metrics.shift();
  }

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.debug(`Performance metric: ${name} = ${value.toFixed(2)}ms`);
  }
};

// Measure the execution time of a function
export const measureExecutionTime = async <T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> => {
  const start = performance.now();
  try {
    return await fn();
  } finally {
    const duration = performance.now() - start;
    trackMetric(name, duration);
  }
};

// Track API call performance
export const trackApiCall = (url: string, duration: number): void => {
  trackMetric(`api_call:${url}`, duration);
};

// Get recent metrics for a specific operation
export const getMetrics = (name?: string): PerformanceMetric[] => {
  if (name) {
    return metrics.filter((metric) => metric.name === name);
  }
  return [...metrics];
};

// Calculate average metric value
export const getAverageMetric = (name: string): number | null => {
  const relevantMetrics = metrics.filter((metric) => metric.name === name);
  if (relevantMetrics.length === 0) return null;

  const sum = relevantMetrics.reduce((acc, metric) => acc + metric.value, 0);
  return sum / relevantMetrics.length;
};

// Report metrics to monitoring service (placeholder)
export const reportMetrics = (): void => {
  // In a real implementation, this would send metrics to a monitoring service
  // For now, we'll just log them to console
  if (metrics.length > 0) {
    console.log("Performance metrics:", metrics);
  }
};

// Track page load performance using Web Vitals API
export const trackPageLoad = (): void => {
  if (typeof window !== "undefined") {
    // Use Performance API to get navigation timing
    const navigationTiming = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;

    if (navigationTiming) {
      // Time to first byte (TTFB)
      const ttfb =
        navigationTiming.responseStart - navigationTiming.requestStart;
      trackMetric("ttfb", ttfb);

      // DOM Content Loaded
      const domContentLoaded =
        navigationTiming.domContentLoadedEventEnd - navigationTiming.fetchStart;
      trackMetric("dom_content_loaded", domContentLoaded);

      // Load event
      const loadEvent =
        navigationTiming.loadEventEnd - navigationTiming.fetchStart;
      trackMetric("load_event", loadEvent);
    }

    // Report largest contentful paint when available
    const reportLCP = () => {
      const lcp = performance
        .getEntriesByType("paint")
        .find((entry) => entry.name === "largest-contentful-paint");

      if (lcp) {
        trackMetric("largest_contentful_paint", lcp.startTime);
      }
    };

    // Wait for LCP to be available
    if (document.readyState === "complete") {
      reportLCP();
    } else {
      window.addEventListener("load", () => {
        // Use a small delay to ensure LCP is available
        setTimeout(reportLCP, 100);
      });
    }
  }
};

// Initialize performance monitoring
export const initPerformanceMonitoring = (): void => {
  if (typeof window !== "undefined") {
    // Track page load metrics
    trackPageLoad();

    // Set up periodic reporting
    setInterval(reportMetrics, 60000); // Report metrics every minute
  }
};
