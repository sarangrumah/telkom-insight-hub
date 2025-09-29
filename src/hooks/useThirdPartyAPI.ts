import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useMonitoring } from './useMonitoring';
import { apiFetch } from '@/lib/apiClient';

interface APICallOptions {
  apiName?: string;
  timeout?: number;
  retries?: number;
}

interface APICallData {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  parameters?: unknown;
}

interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  apiName?: string;
  timestamp?: string;
}

export const useThirdPartyAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { logUserAction, logError } = useMonitoring();

  const callAPI = useCallback(async <T = unknown>(
    data: APICallData,
    options: APICallOptions = {}
  ): Promise<APIResponse<T>> => {
    const { apiName = 'default-api', timeout = 30000, retries = 1 } = options;

    setLoading(true);
    setError(null);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        await logUserAction('api_call_initiated', { apiName, attempt: attempt + 1 });

        // Execute via backend proxy (Node/Express)
        const payload = {
          data,       // { endpoint: string; method: string; parameters: any }
          apiName,    // for logging/metrics
          timeout,    // ms
        };

        const result = await apiFetch('/api/integrations/test', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        await logUserAction('api_call_success', { apiName, result });

        // Ensure loading cleared on success path too
        setLoading(false);
        return result as APIResponse<T>;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Unknown API error');

        if (attempt === retries) {
          await logError(lastError, 'useThirdPartyAPI');
          setError(lastError.message);
          toast.error(`API Integration Error: ${lastError.message}`);
        } else {
          // simple backoff
          await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    setLoading(false);
    throw lastError || new Error('Unknown API error');
  }, [logUserAction, logError]);

  const callAPIWithToast = useCallback(async <T = unknown>(
    data: APICallData,
    options: APICallOptions = {}
  ): Promise<APIResponse<T> | null> => {
    try {
      const result = await callAPI<T>(data, options);
      
      if (result.success) {
        toast.success('API call completed successfully!');
      } else {
        toast.error(`API Error: ${result.error}`);
      }
      
      return result;
    } catch (error) {
      // Error already handled in callAPI
      return null;
    } finally {
      setLoading(false);
    }
  }, [callAPI]);

  return { 
    callAPI, 
    callAPIWithToast,
    loading, 
    error,
    clearError: () => setError(null)
  };
};