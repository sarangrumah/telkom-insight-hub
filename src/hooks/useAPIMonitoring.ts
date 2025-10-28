import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

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
  request_data: unknown;
  response_data: unknown;
}

// Temporary interface until types are regenerated
interface APIIntegrationLog {
  id: string;
  user_id?: string;
  api_name: string;
  request_data?: unknown;
  response_data?: unknown;
  status: string;
  response_time_ms?: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export const useAPIMonitoring = () => {
  const { token } = useAuth();
  const backendUrl = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:4000';
  
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
      
      if (!token()) {
        console.log('No auth token, skipping API metrics fetch');
        setLoading(false);
        return;
      }

      console.log('Fetching API metrics from backend...');
      
      const response = await fetch(`${backendUrl}/api/devsecops/api-metrics`, {
        headers: {
          'Authorization': `Bearer ${token()}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.metrics) {
        setMetrics({
          totalCalls: data.metrics.totalCalls,
          successfulCalls: data.metrics.successfulCalls,
          failedCalls: data.metrics.failedCalls,
          averageResponseTime: data.metrics.averageResponseTime,
          successRate: data.metrics.successRate,
          recentFailures: data.metrics.recentFailures
        });
      }

      // For now, set empty logs since we haven't implemented logs endpoint yet
      setRecentLogs([]);
      
    } catch (error) {
      console.error('Failed to fetch API metrics:', error);
      setMetrics({
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        averageResponseTime: 0,
        successRate: 100,
        recentFailures: 0,
      });
      setRecentLogs([]);
    } finally {
      setLoading(false);
    }
  }, [token, backendUrl]);

  const logAPICall = useCallback(async (
    apiName: string,
    status: 'success' | 'error',
    requestData?: unknown,
    responseData?: unknown,
    responseTimeMs?: number,
    errorMessage?: string
  ) => {
    try {
      console.log('API call logged:', { apiName, status });
      
      if (!token()) {
        console.log('No auth token, skipping API call logging');
        return;
      }
      
      await fetch(`${backendUrl}/api/devsecops/log-api-call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token()}`
        },
        body: JSON.stringify({
          api_name: apiName,
          status,
          request_data: requestData,
          response_data: responseData,
          response_time_ms: responseTimeMs,
          error_message: errorMessage
        })
      });
      
      // Refresh metrics after logging
      await fetchAPIMetrics();
    } catch (error) {
      console.error('Failed to log API call:', error);
    }
  }, [token, backendUrl, fetchAPIMetrics]);

  useEffect(() => {
    fetchAPIMetrics();
    
    // Refresh metrics every 5 minutes
    const interval = setInterval(fetchAPIMetrics, 5 * 60 * 1000);

    return () => {
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