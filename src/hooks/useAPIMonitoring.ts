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
      
      // Get API logs from the last 24 hours
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
      
      const { data: logs, error } = await supabase
        .from('api_integration_logs')
        .select('*')
        .gte('created_at', twentyFourHoursAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching API metrics:', error);
        return;
      }

      const totalCalls = logs?.length || 0;
      const successfulCalls = logs?.filter(log => log.status === 'success').length || 0;
      const failedCalls = totalCalls - successfulCalls;
      const successRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0;
      
      // Get recent failures (last hour)
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);
      const recentFailures = logs?.filter(
        log => log.status === 'error' && new Date(log.created_at) > oneHourAgo
      ).length || 0;

      setMetrics({
        totalCalls,
        successfulCalls,
        failedCalls,
        averageResponseTime: 0, // Would need to track this in logs
        successRate,
        recentFailures,
      });

      setRecentLogs(logs?.slice(0, 10) || []);
    } catch (error) {
      console.error('Failed to fetch API metrics:', error);
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
      await supabase.from('api_integration_logs').insert({
        api_name: apiName,
        status,
        request_data: requestData,
        response_data: responseData,
      });
      
      // Refresh metrics after logging
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