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

export interface Kecamatan {
  id: string;
  name: string;
  type: string;
  parent_id: string;
  kabupaten_id: string;
}

export interface Kelurahan {
  id: string;
  name: string;
  type: string;
  parent_id: string;
  kecamatan_id: string;
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
interface KecamatanResponse {
  kecamatan: {
    id: string;
    name: string;
    type: string;
    parent_id: string;
    kabupaten_id: string;
  }[];
}
interface KelurahanResponse {
  kelurahan: {
    id: string;
    name: string;
    type: string;
    parent_id: string;
    kecamatan_id: string;
  }[];
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
        const provincesResp = await apiFetch('/panel/api/provinces') as ProvincesResponse;
        const kabupatenResp = await apiFetch('/panel/api/kabupaten') as KabupatenResponse;

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

  // Fetch kecamatan by kabupaten_id
  const fetchKecamatanByKabupaten = async (kabupatenId: string): Promise<Kecamatan[]> => {
    try {
      const response = await apiFetch(`/panel/api/kecamatan?kabupaten_id=${kabupatenId}`) as KecamatanResponse;
      return (response.kecamatan || []).map(k => ({
        id: k.id,
        name: k.name,
        type: k.type,
        parent_id: k.parent_id,
        kabupaten_id: k.kabupaten_id
      }));
    } catch (error) {
      console.error('Error fetching kecamatan:', error);
      return [];
    }
  };

  // Fetch kelurahan by kecamatan_id
  const fetchKelurahanByKecamatan = async (kecamatanId: string): Promise<Kelurahan[]> => {
    try {
      const response = await apiFetch(`/panel/api/kelurahan?kecamatan_id=${kecamatanId}`) as KelurahanResponse;
      return (response.kelurahan || []).map(k => ({
        id: k.id,
        name: k.name,
        type: k.type,
        parent_id: k.parent_id,
        kecamatan_id: k.kecamatan_id
      }));
    } catch (error) {
      console.error('Error fetching kelurahan:', error);
      return [];
    }
  };

  return {
    provinces,
    allKabupaten,
    loading,
    error,
    getKabupaténByProvince,
    getKabupaténById,
    getProvinceById,
    fetchKecamatanByKabupaten,
    fetchKelurahanByKecamatan,
    refetch: () => {
      // allow manual refetch by re-running effect logic
      // we could extract logic but simplest is to call fetchLocationData again
      // however fetchLocationData is inside effect; replicate minimal logic here
      (async () => {
        try {
          setLoading(true);
          setError(null);
          const provincesResp = await apiFetch('/panel/api/provinces') as ProvincesResponse;
          const kabupatenResp = await apiFetch('/panel/api/kabupaten') as KabupatenResponse;
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
