import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { apiFetch } from '@/lib/apiClient';

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
      return apiFetch('/panel/api/auth/verification-status') as Promise<VerificationStatus>;
    },
    enabled: !!token(), // Only run query if token exists
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};