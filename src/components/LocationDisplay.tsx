import { useLocationData } from '@/hooks/useLocationData';

interface LocationDisplayProps {
  provinceId?: string;
  kabupaténId?: string;
  kecamatan?: string;
  kelurahan?: string;
  showFull?: boolean;
}

export function LocationDisplay({ 
  provinceId, 
  kabupaténId, 
  kecamatan, 
  kelurahan,
  showFull = false 
}: LocationDisplayProps) {
  const { getProvinceById, getKabupaténById } = useLocationData();

  const province = provinceId ? getProvinceById(provinceId) : null;
  const kabupaten = kabupaténId ? getKabupaténById(kabupaténId) : null;

  if (showFull) {
    const parts = [];
    if (kelurahan) parts.push(`Kelurahan ${kelurahan}`);
    if (kecamatan) parts.push(`Kecamatan ${kecamatan}`);
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