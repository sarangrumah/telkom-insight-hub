import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useLocationData } from '@/hooks/useLocationData';

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

export function LocationSelector({ value, onChange, required = false }: LocationSelectorProps) {
  const { provinces, getKabupaténByProvince, loading, fetchKecamatanByKabupaten, fetchKelurahanByKecamatan } = useLocationData();
  const [kecamatanList, setKecamatanList] = useState<{ id: string; name: string }[]>([]);
  const [kelurahanList, setKelurahanList] = useState<{ id: string; name: string }[]>([]);
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
        const kecamatanData = await fetchKecamatanByKabupaten(value.kabupaténId);
        setKecamatanList(kecamatanData.map(k => ({ id: k.id, name: k.name })));
      } catch (error) {
        console.error('Error loading kecamatan:', error);
        setKecamatanList([]);
      } finally {
        setLoadingKecamatan(false);
      }
    };
  
    loadKecamatan();
  }, [value.kabupaténId, fetchKecamatanByKabupaten]);

  // Load kelurahan when kecamatan changes
  useEffect(() => {
    const loadKelurahan = async () => {
      if (!value.kecamatan) {
        setKelurahanList([]);
        return;
      }

      setLoadingKelurahan(true);
      try {
        // Find the kecamatan id from the name
        const kecamatanItem = kecamatanList.find(k => k.name === value.kecamatan);
        if (kecamatanItem) {
          const kelurahanData = await fetchKelurahanByKecamatan(kecamatanItem.id);
          setKelurahanList(kelurahanData.map(k => ({ id: k.id, name: k.name })));
        }
      } catch (error) {
        console.error('Error loading kelurahan:', error);
        setKelurahanList([]);
      } finally {
        setLoadingKelurahan(false);
      }
    };

    loadKelurahan();
  }, [value.kecamatan, kecamatanList, fetchKelurahanByKecamatan]);

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

  const handleKecamatanChange = (kecamatanId: string) => {
    // Find the kecamatan name from the list
    const kecamatanItem = kecamatanList.find(k => k.id === kecamatanId);
    onChange({
      ...value,
      kecamatan: kecamatanItem?.name || kecamatanId, // Save name instead of id
      kelurahan: undefined
    });
 };

  const handleKelurahanChange = (kelurahanId: string) => {
    // Find the kelurahan name from the list
    const kelurahanItem = kelurahanList.find(k => k.id === kelurahanId);
    onChange({
      ...value,
      kelurahan: kelurahanItem?.name || kelurahanId // Save name instead of id
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
          value={value.kecamatan ?
            kecamatanList.find(k => k.name === value.kecamatan)?.id || ''
            : ''}
          onValueChange={handleKecamatanChange}
          disabled={!value.kabupaténId || loadingKecamatan}
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingKecamatan ? "Loading..." : "Pilih Kecamatan"} />
          </SelectTrigger>
          <SelectContent className="z-[100]">
            {kecamatanList.map((kecamatan) => (
              <SelectItem key={kecamatan.id} value={kecamatan.id}>
                {kecamatan.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Kelurahan {required && <span className="text-destructive">*</span>}</Label>
        <Select
          value={value.kelurahan ?
            kelurahanList.find(k => k.name === value.kelurahan)?.id || ''
            : ''}
          onValueChange={handleKelurahanChange}
          disabled={!value.kecamatan || loadingKelurahan}
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingKelurahan ? "Loading..." : "Pilih Kelurahan"} />
          </SelectTrigger>
          <SelectContent className="z-[100]">
            {kelurahanList.map((kelurahan) => (
              <SelectItem key={kelurahan.id} value={kelurahan.id}>
                {kelurahan.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}