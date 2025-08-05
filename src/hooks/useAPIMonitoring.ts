import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface APIMetrics {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  averageResponseTime: number;
  successRate: number;
  recentFailures: number;
}

interface APILogEntry {
  id: string;
  api_name: string;
  status: string;
  created_at: string;
  request_data: any;
  response_data: any;
}

// Temporary interface until types are regenerated
interface APIIntegrationLog {
  id: string;
  user_id?: string;
  api_name: string;
  request_data?: any;
  response_data?: any;
  status: string;
  response_time_ms?: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export const useAPIMonitoring = () => {
  const [metrics, setMetrics] = useState<APIMetrics>({
    totalCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    averageResponseTime: 0,
    successRate: 0,
    recentFailures: 0,
  });
  const [recentLogs, setRecentLogs] = useState<APILogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAPIMetrics = useCallback(async () => {
    try {
      setLoading(true);
      
      // For now, return mock data since the table was just created
      // The types will be regenerated after Supabase sync
      console.log('API monitoring initialized - showing placeholder metrics');
      
      setMetrics({
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        averageResponseTime: 0,
        successRate: 100,
        recentFailures: 0,
      });

      setRecentLogs([]);
    } catch (error) {
      console.error('Failed to fetch API metrics:', error);
      setMetrics({
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        averageResponseTime: 0,
        successRate: 0,
        recentFailures: 0,
      });
      setRecentLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const logAPICall = useCallback(async (
    apiName: string,
    status: 'success' | 'error',
    requestData?: any,
    responseData?: any
  ) => {
    try {
      console.log('API call logged:', { apiName, status });
      // API logging will be implemented once types are regenerated
      await fetchAPIMetrics();
    } catch (error) {
      console.error('Failed to log API call:', error);
    }
  }, [fetchAPIMetrics]);

  useEffect(() => {
    fetchAPIMetrics();
    
    // Set up real-time subscription for API logs
    const subscription = supabase
      .channel('api_integration_logs')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'api_integration_logs' },
        () => {
          fetchAPIMetrics();
        }
      )
      .subscribe();

    // Refresh metrics every 5 minutes
    const interval = setInterval(fetchAPIMetrics, 5 * 60 * 1000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [fetchAPIMetrics]);

  return {
    metrics,
    recentLogs,
    loading,
    logAPICall,
    refreshMetrics: fetchAPIMetrics,
  };
};