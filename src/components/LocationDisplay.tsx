import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocationData } from '@/hooks/useLocationData';

interface LocationDisplayProps {
  provinceId?: string;
  kabupaténId?: string;
  kecamatan?: string;
  kelurahan?: string;
  showFull?: boolean;
}

interface RegionData {
  region_id: string;
  name: string;
}

export function LocationDisplay({ 
  provinceId, 
  kabupaténId, 
  kecamatan, 
  kelurahan,
  showFull = false 
}: LocationDisplayProps) {
  const { getProvinceById, getKabupaténById } = useLocationData();
  const [kecamatanName, setKecamatanName] = useState<string>('');
  const [kelurahanName, setKelurahanName] = useState<string>('');

  useEffect(() => {
    const loadKecamatanName = async () => {
      if (!kecamatan) return;
      
      try {
        const { data, error } = await supabase
          .from('indonesian_regions')
          .select('name')
          .eq('region_id', kecamatan)
          .single();
          
        if (!error && data) {
          setKecamatanName(data.name);
        }
      } catch (error) {
        console.error('Error loading kecamatan name:', error);
      }
    };

    loadKecamatanName();
  }, [kecamatan]);

  useEffect(() => {
    const loadKelurahanName = async () => {
      if (!kelurahan) return;
      
      try {
        const { data, error } = await supabase
          .from('indonesian_regions')
          .select('name')
          .eq('region_id', kelurahan)
          .single();
          
        if (!error && data) {
          setKelurahanName(data.name);
        }
      } catch (error) {
        console.error('Error loading kelurahan name:', error);
      }
    };

    loadKelurahanName();
  }, [kelurahan]);

  const province = provinceId ? getProvinceById(provinceId) : null;
  const kabupaten = kabupaténId ? getKabupaténById(kabupaténId) : null;

  if (showFull) {
    const parts = [];
    if (kelurahanName) parts.push(`Kelurahan ${kelurahanName}`);
    if (kecamatanName) parts.push(`Kecamatan ${kecamatanName}`);
    if (kabupaten) parts.push(`${kabupaten.type === 'kota' ? 'Kota' : 'Kabupaten'} ${kabupaten.name}`);
    if (province) parts.push(`Provinsi ${province.name}`);
    
    return <span>{parts.join(', ')}</span>;
  }

  // Short format - just show main locations
  const shortParts = [];
  if (kabupaten) shortParts.push(`${kabupaten.type === 'kota' ? 'Kota' : 'Kab.'} ${kabupaten.name}`);
  if (province) shortParts.push(province.name);
  
  return <span>{shortParts.join(', ')}</span>;
}