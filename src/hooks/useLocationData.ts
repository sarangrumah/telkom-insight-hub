import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/apiClient';

export interface Province {
  id: string;
  code: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface Kabupaten {
  id: string;
  province_id: string;
  code: string;
  name: string;
  type: 'kabupaten' | 'kota';
  latitude: number;
  longitude: number;
  province?: Province;
}

interface ProvincesResponse {
  provinces: Province[];
}
interface KabupatenRow {
  id: string;
  province_id: string;
  code: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  province?: Province;
}
interface KabupatenResponse {
  kabupaten: KabupatenRow[];
}

function extractErrorMessage(err: unknown): string {
  if (typeof err === 'string') return err;
  if (
    err &&
    typeof err === 'object' &&
    'message' in err &&
    typeof (err as { message?: unknown }).message === 'string'
  ) {
    return (err as { message: string }).message;
  }
  return 'Unknown error loading location data';
}

export const useLocationData = () => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [allKabupaten, setAllKabupaten] = useState<Kabupaten[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Hit backend endpoints (must be implemented on server)
        const provincesResp = await apiFetch<ProvincesResponse>(
          '/api/provinces'
        );
        const kabupatenResp = await apiFetch<KabupatenResponse>(
          '/api/kabupaten'
        );

        setProvinces(provincesResp.provinces || []);
        setAllKabupaten(
          (kabupatenResp.kabupaten || []).map(k => ({
            ...k,
            type: (k.type === 'kota' ? 'kota' : 'kabupaten') as
              | 'kabupaten'
              | 'kota',
          }))
        );
      } catch (e: unknown) {
        const message = extractErrorMessage(e);
        console.error('Error fetching location data:', e);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationData();
  }, []);

  const getKabupaténByProvince = (provinceId: string): Kabupaten[] => {
    return allKabupaten.filter(k => k.province_id === provinceId);
  };

  const getKabupaténById = (id: string): Kabupaten | undefined => {
    return allKabupaten.find(k => k.id === id);
  };

  const getProvinceById = (id: string): Province | undefined => {
    return provinces.find(p => p.id === id);
  };

  return {
    provinces,
    allKabupaten,
    loading,
    error,
    getKabupaténByProvince,
    getKabupaténById,
    getProvinceById,
    refetch: () => {
      // allow manual refetch by re-running effect logic
      // we could extract logic but simplest is to call fetchLocationData again
      // however fetchLocationData is inside effect; replicate minimal logic here
      (async () => {
        try {
          setLoading(true);
          setError(null);
          const provincesResp = await apiFetch<ProvincesResponse>(
            '/api/provinces'
          );
          const kabupatenResp = await apiFetch<KabupatenResponse>(
            '/api/kabupaten'
          );
          setProvinces(provincesResp.provinces || []);
          setAllKabupaten(
            (kabupatenResp.kabupaten || []).map(k => ({
              ...k,
              type: (k.type === 'kota' ? 'kota' : 'kabupaten') as
                | 'kabupaten'
                | 'kota',
            }))
          );
        } catch (e: unknown) {
          const message = extractErrorMessage(e);
          console.error('Error fetching location data (manual refetch):', e);
          setError(message);
        } finally {
          setLoading(false);
        }
      })();
    },
  };
};
