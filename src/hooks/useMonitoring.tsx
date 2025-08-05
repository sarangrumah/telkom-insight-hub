import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  const logError = useCallback(async (error: Error, component?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const errorInfo: ErrorInfo = {
        message: error.message,
        stack: error.stack,
        component,
        userId: user?.id,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      // Log to console for development
      if (process.env.NODE_ENV === 'development') {
        console.error('Application Error:', errorInfo);
      }

      // In production, you would send this to your monitoring service
      // Example: await monitoringService.logError(errorInfo);
      
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  }, []);

  const logPerformance = useCallback(async (page: string, loadTime: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const metrics: PerformanceMetrics = {
        page,
        loadTime,
        userId: user?.id,
        timestamp: new Date().toISOString(),
      };

      // Log performance metrics
      if (process.env.NODE_ENV === 'development') {
        console.log('Performance Metrics:', metrics);
      }

      // In production, send to analytics service
      // Example: await analyticsService.logPerformance(metrics);
      
    } catch (error) {
      console.error('Failed to log performance:', error);
    }
  }, []);

  const logUserAction = useCallback(async (action: string, details?: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const actionLog = {
        action,
        details,
        userId: user?.id,
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
      };

      // Log user actions for analytics
      if (process.env.NODE_ENV === 'development') {
        console.log('User Action:', actionLog);
      }

      // In production, send to analytics service
      // Example: await analyticsService.logUserAction(actionLog);
      
    } catch (error) {
      console.error('Failed to log user action:', error);
    }
  }, []);

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