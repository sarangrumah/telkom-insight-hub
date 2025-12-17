import { useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

interface ErrorInfo {
  message: string;
  stack?: string;
  component?: string;
  userId?: string;
  timestamp: string;
  url: string;
  userAgent: string;
}

interface PerformanceMetrics {
  page: string;
  loadTime: number;
  userId?: string;
  timestamp: string;
}

export function useMonitoring() {
  const { token } = useAuth();
  const rawBackendUrl = (import.meta.env.VITE_API_BASE_URL as string) || '';
  const backendUrl = rawBackendUrl.endsWith('/panel') ? rawBackendUrl.slice(0, -6) : rawBackendUrl;

  const logError = useCallback(async (error: Error, component?: string) => {
    try {
      const errorInfo: ErrorInfo = {
        message: error.message,
        stack: error.stack,
        component,
        userId: '', // Will be set by backend from token
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      // Log to console for development
      if (import.meta.env.DEV) {
        console.error('Application Error:', errorInfo);
      }

      // Send to backend monitoring service
      if (token()) {
        await fetch(`${backendUrl}/panel/api/devsecops/log-activity`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token()}`
          },
          body: JSON.stringify({
            action: 'error_logged',
            details: errorInfo,
            page: window.location.pathname
          })
        });
      }
      
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  }, [token, backendUrl]);

  const logPerformance = useCallback(async (page: string, loadTime: number) => {
    try {
      const metrics: PerformanceMetrics = {
        page,
        loadTime,
        userId: '', // Will be set by backend from token
        timestamp: new Date().toISOString(),
      };

      // Log performance metrics
      if (import.meta.env.DEV) {
        console.log('Performance Metrics:', metrics);
      }

      // Send to backend analytics service
      if (token()) {
        await fetch(`${backendUrl}/panel/api/devsecops/log-activity`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token()}`
          },
          body: JSON.stringify({
            action: 'performance_logged',
            details: metrics,
            page
          })
        });
      }
      
    } catch (error) {
      console.error('Failed to log performance:', error);
    }
  }, [token, backendUrl]);

  const logUserAction = useCallback(async (action: string, details?: unknown) => {
    try {
      const actionLog = {
        action,
        details,
        userId: '', // Will be set by backend from token
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
      };

      // Log user actions for analytics
      if (import.meta.env.DEV) {
        console.log('User Action:', actionLog);
      }

      // Send to backend analytics service
      if (token()) {
        await fetch(`${backendUrl}/panel/api/devsecops/log-activity`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token()}`
          },
          body: JSON.stringify({
            action,
            details,
            page: window.location.pathname
          })
        });
      }
      
    } catch (error) {
      console.error('Failed to log user action:', error);
    }
  }, [token, backendUrl]);

  useEffect(() => {
    // Global error handler
    const handleError = (event: ErrorEvent) => {
      logError(new Error(event.message), 'Global');
    };

    // Promise rejection handler
    const handleRejection = (event: PromiseRejectionEvent) => {
      logError(new Error(event.reason), 'Promise');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    // Performance monitoring
    const measurePageLoad = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
          logPerformance(window.location.pathname, loadTime);
        }
      }
    };

    // Measure page load after everything is loaded
    if (document.readyState === 'complete') {
      measurePageLoad();
    } else {
      window.addEventListener('load', measurePageLoad);
    }

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
      window.removeEventListener('load', measurePageLoad);
    };
  }, [logError, logPerformance]);

  return {
    logError,
    logPerformance,
    logUserAction,
  };
}