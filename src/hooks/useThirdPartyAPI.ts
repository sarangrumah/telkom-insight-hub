import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMonitoring } from './useMonitoring';

interface APICallOptions {
  apiName?: string;
  timeout?: number;
  retries?: number;
}

interface APIResponse<T = any> {
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

  const callAPI = useCallback(async <T = any>(
    data: any, 
    options: APICallOptions = {}
  ): Promise<APIResponse<T>> => {
    const { apiName = 'default-api', timeout = 30000, retries = 1 } = options;
    
    setLoading(true);
    setError(null);
    
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        await logUserAction('api_call_initiated', { apiName, attempt: attempt + 1 });
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const { data: result, error: apiError } = await supabase.functions.invoke(
          'api-integration-example',
          {
            body: { data, apiName },
          }
        );
        
        clearTimeout(timeoutId);
        
        if (apiError) {
          throw new Error(apiError.message || 'API call failed');
        }
        
        await logUserAction('api_call_success', { apiName, result });
        
        return result as APIResponse<T>;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Unknown API error');
        
        if (attempt === retries) {
          await logError(lastError, 'useThirdPartyAPI');
          setError(lastError.message);
          toast.error(`API Integration Error: ${lastError.message}`);
        } else {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }
    
    setLoading(false);
    throw lastError;
  }, [logUserAction, logError]);

  const callAPIWithToast = useCallback(async <T = any>(
    data: any, 
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