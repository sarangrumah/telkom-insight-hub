-- Insert sample telecommunications data for testing the map with correct enum and status values
INSERT INTO public.telekom_data (company_name, service_type, status, region, latitude, longitude, license_date, license_number) VALUES
('Telkomsel Jakarta', 'telekomunikasi_khusus', 'active', 'Jakarta', -6.2088, 106.8456, '2023-01-15', 'TLK-2023-001'),
('Indosat Ooredoo Surabaya', 'telekomunikasi_khusus', 'active', 'Surabaya', -7.2575, 112.7521, '2023-02-10', 'IDO-2023-002'),
('XL Axiata Bandung', 'telekomunikasi_khusus', 'active', 'Bandung', -6.9175, 107.6191, '2023-03-05', 'XLA-2023-003'),
('Biznet Networks', 'jasa', 'active', 'Jakarta', -6.1751, 106.8650, '2023-01-20', 'BIZ-2023-004'),
('CBN Fiber', 'jaringan', 'active', 'Jakarta', -6.2297, 106.8261, '2023-02-15', 'CBN-2023-005'),
('Telkom Indonesia', 'jaringan', 'active', 'Yogyakarta', -7.7956, 110.3695, '2023-03-01', 'TLK-2023-006'),
('First Media', 'jasa', 'active', 'Tangerang', -6.1783, 106.6319, '2023-01-25', 'FMD-2023-007'),
('Smartfren', 'telekomunikasi_khusus', 'active', 'Medan', 3.5952, 98.6722, '2023-02-20', 'SMF-2023-008'),
('Pasifik Satelit Nusantara', 'isr', 'active', 'Makassar', -5.1477, 119.4327, '2023-03-10', 'PSN-2023-009'),
('Hughes Network Systems', 'isr', 'suspended', 'Denpasar', -8.6705, 115.2126, '2023-03-15', 'HNS-2023-010'),
('Moratelindo', 'jasa', 'active', 'Semarang', -6.9667, 110.4167, '2023-02-25', 'MTI-2023-011'),
('Icon Plus', 'jasa', 'inactive', 'Palembang', -2.9761, 104.7754, '2023-01-30', 'ICP-2023-012');