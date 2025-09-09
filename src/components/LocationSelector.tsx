import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useLocationData } from '@/hooks/useLocationData';
import { supabase } from '@/integrations/supabase/client';

interface LocationSelectorProps {
  value: {
    provinceId?: string;
    kabupaténId?: string;
    kecamatan?: string;
    kelurahan?: string;
  };
  onChange: (location: {
    provinceId?: string;
    kabupaténId?: string;
    kecamatan?: string;
    kelurahan?: string;
  }) => void;
  required?: boolean;
}

interface Kecamatan {
  region_id: string;
  name: string;
}

interface Kelurahan {
  region_id: string;
  name: string;
}

export function LocationSelector({ value, onChange, required = false }: LocationSelectorProps) {
  const { provinces, getKabupaténByProvince, loading } = useLocationData();
  const [kecamatanList, setKecamatanList] = useState<Kecamatan[]>([]);
  const [kelurahanList, setKelurahanList] = useState<Kelurahan[]>([]);
  const [loadingKecamatan, setLoadingKecamatan] = useState(false);
  const [loadingKelurahan, setLoadingKelurahan] = useState(false);

  // Load kecamatan when kabupaten changes
  useEffect(() => {
    const loadKecamatan = async () => {
      if (!value.kabupaténId) {
        setKecamatanList([]);
        return;
      }

      setLoadingKecamatan(true);
      try {
        // Get the kabupaten code from the kabupaten table
        const { data: kabupaténData, error: kabupaténError } = await supabase
          .from('kabupaten')
          .select('code')
          .eq('id', value.kabupaténId)
          .single();

        if (kabupaténError) throw kabupaténError;

        const { data, error } = await supabase
          .from('indonesian_regions')
          .select('region_id, name')
          .eq('type', 'district')
          .eq('parent_id', kabupaténData.code)
          .order('name');

        if (error) throw error;
        setKecamatanList(data || []);
      } catch (error) {
        console.error('Error loading kecamatan:', error);
        setKecamatanList([]);
      } finally {
        setLoadingKecamatan(false);
      }
    };

    loadKecamatan();
  }, [value.kabupaténId]);

  // Load kelurahan when kecamatan changes
  useEffect(() => {
    const loadKelurahan = async () => {
      if (!value.kecamatan) {
        setKelurahanList([]);
        return;
      }

      setLoadingKelurahan(true);
      try {
        const { data, error } = await supabase
          .from('indonesian_regions')
          .select('region_id, name')
          .eq('type', 'village')
          .eq('parent_id', value.kecamatan)
          .order('name');

        if (error) throw error;
        setKelurahanList(data || []);
      } catch (error) {
        console.error('Error loading kelurahan:', error);
        setKelurahanList([]);
      } finally {
        setLoadingKelurahan(false);
      }
    };

    loadKelurahan();
  }, [value.kecamatan]);

  const handleProvinceChange = (provinceId: string) => {
    onChange({
      provinceId,
      kabupaténId: undefined,
      kecamatan: undefined,
      kelurahan: undefined
    });
  };

  const handleKabupaténChange = (kabupaténId: string) => {
    onChange({
      ...value,
      kabupaténId,
      kecamatan: undefined,
      kelurahan: undefined
    });
  };

  const handleKecamatanChange = (kecamatan: string) => {
    onChange({
      ...value,
      kecamatan,
      kelurahan: undefined
    });
  };

  const handleKelurahanChange = (kelurahan: string) => {
    onChange({
      ...value,
      kelurahan
    });
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading location data...</div>;
  }

  const kabupatenList = value.provinceId ? getKabupaténByProvince(value.provinceId) : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Provinsi {required && <span className="text-destructive">*</span>}</Label>
        <Select value={value.provinceId || ''} onValueChange={handleProvinceChange}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih Provinsi" />
          </SelectTrigger>
        <SelectContent className="z-[100]">
          {provinces.map((province) => (
            <SelectItem key={province.id} value={province.id}>
              {province.name}
            </SelectItem>
          ))}
        </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Kabupaten/Kota {required && <span className="text-destructive">*</span>}</Label>
        <Select 
          value={value.kabupaténId || ''} 
          onValueChange={handleKabupaténChange}
          disabled={!value.provinceId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih Kabupaten/Kota" />
          </SelectTrigger>
        <SelectContent className="z-[100]">
          {kabupatenList.map((kabupaten) => (
            <SelectItem key={kabupaten.id} value={kabupaten.id}>
              {kabupaten.type === 'kota' ? 'Kota ' : 'Kabupaten '}{kabupaten.name}
            </SelectItem>
          ))}
        </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Kecamatan {required && <span className="text-destructive">*</span>}</Label>
        <Select 
          value={value.kecamatan || ''} 
          onValueChange={handleKecamatanChange}
          disabled={!value.kabupaténId || loadingKecamatan}
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingKecamatan ? "Loading..." : "Pilih Kecamatan"} />
          </SelectTrigger>
        <SelectContent className="z-[100]">
          {kecamatanList.map((kecamatan) => (
            <SelectItem key={kecamatan.region_id} value={kecamatan.region_id}>
              {kecamatan.name}
            </SelectItem>
          ))}
        </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Kelurahan {required && <span className="text-destructive">*</span>}</Label>
        <Select 
          value={value.kelurahan || ''} 
          onValueChange={handleKelurahanChange}
          disabled={!value.kecamatan || loadingKelurahan}
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingKelurahan ? "Loading..." : "Pilih Kelurahan"} />
          </SelectTrigger>
        <SelectContent className="z-[100]">
          {kelurahanList.map((kelurahan) => (
            <SelectItem key={kelurahan.region_id} value={kelurahan.region_id}>
              {kelurahan.name}
            </SelectItem>
          ))}
        </SelectContent>
        </Select>
      </div>
    </div>
  );
}