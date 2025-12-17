import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';

export interface TelekomDataRecord extends Record<string, unknown> {
  id: string;
  company_name: string;
  status?: string | null;
  license_date?: string | null;
  region?: string | null;
  sub_service?: {
    id: string;
    name: string;
    service?: { id: string; name: string; code?: string | null } | null;
  } | null;
  file_url?: string | null;
  created_at: string;
  created_by?: string | null;
  // Additional dynamic fields allowed
  // allow dynamic extra fields from backend response
}

interface ListResponse {
  data: TelekomDataRecord[];
  page: number;
  pageSize: number;
  total: number;
}

export type TelekomListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  service_type?: string;
  province_id?: string;
  kabupaten_id?: string;
  date_from?: string;
  date_to?: string;
};

const LIST_KEY = ['telekom-data', 'list'];

export function useTelekomDataList(params: TelekomListParams = {}, enabled = true) {
  return useQuery<ListResponse, Error>({
    queryKey: [...LIST_KEY, params],
    enabled,
    queryFn: async () => {
      const qs = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && String(v).length > 0) {
          qs.append(k, String(v));
        }
      });
      const q = qs.toString();
      const url = q ? `/panel/api/telekom-data?${q}` : '/panel/api/telekom-data';
      const data = await apiFetch(url);
      return data as ListResponse;
    },
  });
}

interface CreatePayload extends Record<string, unknown> {
  company_name: string;
  status?: string;
  license_date?: string | null;
  region?: string | null;
  sub_service_id?: string | null;
  file_url?: string | null;
  // dynamic fields allowed
}

interface UpdatePayload extends Partial<CreatePayload> {
  id: string;
}

export function useCreateTelekomData() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePayload) => {
      const data = await apiFetch('/panel/api/telekom-data', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
}

export function useUpdateTelekomData() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdatePayload) => {
      const { id, ...rest } = payload;
      const data = await apiFetch(`/panel/api/telekom-data/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(rest),
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
}

export function useDeleteTelekomData() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const data = await apiFetch(`/panel/api/telekom-data/${id}`, {
        method: 'DELETE',
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
}

// Convenience aggregate hook
export function useTelekomDataCrud() {
  const list = useTelekomDataList();
  const create = useCreateTelekomData();
  const update = useUpdateTelekomData();
  const del = useDeleteTelekomData();
  return { list, create, update, del };
}
