-- Add sub_service_type column to telekom_data table
ALTER TABLE public.telekom_data 
ADD COLUMN sub_service_type TEXT;

-- Create index for better performance on sub_service_type filtering
CREATE INDEX idx_telekom_data_sub_service_type ON public.telekom_data(sub_service_type);

-- Update existing data with appropriate sub-service types based on the provided mapping
UPDATE public.telekom_data 
SET sub_service_type = 
  CASE 
    WHEN service_type = 'jasa' THEN 'Izin Penyelenggaraan Jasa Akses Internet (Internet Service Provider/ISP)'
    WHEN service_type = 'jaringan' THEN 'Izin Penyelenggaraan Jaringan Tetap Lokal Berbasis Packet Switched melalui Media Fiber Optik'
    WHEN service_type = 'telekomunikasi_khusus' THEN 'Izin Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Sendiri'
    WHEN service_type = 'isr' THEN 'Izin Stasiun Radio'
    WHEN service_type = 'tarif' THEN 'Persetujuan Tarif'
    WHEN service_type = 'sklo' THEN 'Sertifikat Kelaikan Operasi'
    WHEN service_type = 'lko' THEN 'Sertifikat Laik Operasi'
    ELSE 'Layanan Lainnya'
  END
WHERE sub_service_type IS NULL;