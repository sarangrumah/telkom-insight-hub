-- Update sample data with proper sub-service types based on main service types
UPDATE public.telekom_data 
SET sub_service_type = 
  CASE 
    WHEN service_type = 'jasa' AND company_name LIKE '%Biznet%' THEN 'Izin Penyelenggaraan Jasa Akses Internet (Internet Service Provider/ISP)'
    WHEN service_type = 'jasa' AND company_name LIKE '%First Media%' THEN 'Izin Penyelenggaraan Jasa Televisi Protokol Internet (Internet Protocol Television/IPTV)'
    WHEN service_type = 'jasa' AND company_name LIKE '%Moratelindo%' THEN 'Izin Penyelenggaraan Jasa Sistem Komunikasi Data'
    WHEN service_type = 'jasa' AND company_name LIKE '%Icon Plus%' THEN 'Izin Penyelenggaraan Jasa Akses Internet (Internet Service Provider/ISP)'
    
    WHEN service_type = 'jaringan' AND company_name LIKE '%CBN%' THEN 'Izin Penyelenggaraan Jaringan Tetap Lokal Berbasis Packet Switched melalui Media Fiber Optik'
    WHEN service_type = 'jaringan' AND company_name LIKE '%Telkom%' THEN 'Izin Penyelenggaraan Jaringan Tetap Lokal Berbasis Circuit Switched melalui Media Fiber Optik'
    
    WHEN service_type = 'telekomunikasi_khusus' THEN 'Izin Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Sendiri'
    
    WHEN service_type = 'isr' THEN 'Izin Stasiun Radio'
    
    ELSE sub_service_type -- Keep existing values for other types
  END
WHERE sub_service_type IS NULL OR sub_service_type IN (
  'Izin Penyelenggaraan Jasa Akses Internet (Internet Service Provider/ISP)',
  'Izin Penyelenggaraan Jaringan Tetap Lokal Berbasis Packet Switched melalui Media Fiber Optik',
  'Izin Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Sendiri',
  'Izin Stasiun Radio',
  'Persetujuan Tarif',
  'Sertifikat Kelaikan Operasi',
  'Sertifikat Laik Operasi',
  'Layanan Lainnya'
);