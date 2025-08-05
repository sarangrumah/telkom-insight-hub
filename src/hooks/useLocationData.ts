import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export const useLocationData = () => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [allKabupaten, setAllKabupaten] = useState<Kabupaten[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        // Fetch provinces
        const { data: provincesData, error: provincesError } = await supabase
          .from('provinces')
          .select('*')
          .order('name');

        if (provincesError) throw provincesError;

        // Fetch kabupaten with province info
        const { data: kabupaténData, error: kabupaténError } = await supabase
          .from('kabupaten')
          .select(`
            *,
            province:provinces(*)
          `)
          .order('name');

        if (kabupaténError) throw kabupaténError;

        setProvinces(provincesData || []);
        setAllKabupaten((kabupaténData || []).map(k => ({
          ...k,
          type: k.type as 'kabupaten' | 'kota'
        })));
      } catch (error) {
        console.error('Error fetching location data:', error);
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
    getKabupaténByProvince,
    getKabupaténById,
    getProvinceById
  };
};