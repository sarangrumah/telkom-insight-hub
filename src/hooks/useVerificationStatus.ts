import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';

export interface VerificationStatus {
  success: boolean;
  status: string;
  company: any;
  user: any;
  notification_message: string;
}

export const useVerificationStatus = () => {
  const { token } = useAuth();
  
  return useQuery<VerificationStatus, Error>({
    queryKey: ['verification-status'],
    queryFn: async () => {
      const response = await fetch('/api/auth/verification-status', {
        headers: {
          'Authorization': `Bearer ${token()}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch verification status');
      }
      
      return response.json();
    },
    enabled: !!token(), // Only run query if token exists
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};