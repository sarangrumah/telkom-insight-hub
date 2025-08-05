-- Create comprehensive sample telekom data for visualization with correct enum values
INSERT INTO telekom_data (
  company_name, 
  service_type, 
  sub_service_type, 
  license_number, 
  license_date, 
  province_id, 
  kabupaten_id, 
  status, 
  latitude, 
  longitude,
  region
) VALUES 
-- Jakarta sample data
('PT Telkomsel Jakarta', 'jasa', 'Penyelenggara Jasa Internet', 'TEL-JKT-001', '2023-01-15', 
 (SELECT id FROM provinces WHERE name = 'DKI Jakarta' LIMIT 1), 
 (SELECT id FROM kabupaten WHERE name = 'Jakarta Pusat' LIMIT 1), 
 'active', -6.2088, 106.8456, 'DKI Jakarta'),

('PT Indosat Jakarta', 'jasa', 'Penyelenggara Jasa Internet', 'IND-JKT-002', '2023-02-20', 
 (SELECT id FROM provinces WHERE name = 'DKI Jakarta' LIMIT 1), 
 (SELECT id FROM kabupaten WHERE name = 'Jakarta Selatan' LIMIT 1), 
 'active', -6.2614, 106.8106, 'DKI Jakarta'),

('PT XL Axiata Jakarta', 'jasa', 'Penyelenggara Jasa Internet', 'XL-JKT-003', '2023-03-10', 
 (SELECT id FROM provinces WHERE name = 'DKI Jakarta' LIMIT 1), 
 (SELECT id FROM kabupaten WHERE name = 'Jakarta Utara' LIMIT 1), 
 'active', -6.1478, 106.8740, 'DKI Jakarta'),

-- West Java sample data
('PT Telkomsel Bandung', 'jasa', 'Penyelenggara Jasa Internet', 'TEL-BDG-004', '2023-01-25', 
 (SELECT id FROM provinces WHERE name = 'Jawa Barat' LIMIT 1), 
 (SELECT id FROM kabupaten WHERE name = 'Bandung' LIMIT 1), 
 'active', -6.9175, 107.6191, 'Jawa Barat'),

('PT Indosat Bekasi', 'jasa', 'Penyelenggara Jasa Internet', 'IND-BKS-005', '2023-04-15', 
 (SELECT id FROM provinces WHERE name = 'Jawa Barat' LIMIT 1), 
 (SELECT id FROM kabupaten WHERE name = 'Bekasi' LIMIT 1), 
 'active', -6.2441, 106.9991, 'Jawa Barat'),

-- Central Java sample data
('PT Smartfren Semarang', 'jasa', 'Penyelenggara Jasa Internet', 'SMT-SMG-006', '2023-02-10', 
 (SELECT id FROM provinces WHERE name = 'Jawa Tengah' LIMIT 1), 
 (SELECT id FROM kabupaten WHERE name = 'Semarang' LIMIT 1), 
 'active', -6.9933, 110.4203, 'Jawa Tengah'),

('PT Tri Jogja', 'jasa', 'Penyelenggara Jasa Internet', 'TRI-JOG-007', '2023-03-05', 
 (SELECT id FROM provinces WHERE name = 'DI Yogyakarta' LIMIT 1), 
 (SELECT id FROM kabupaten WHERE name = 'Yogyakarta' LIMIT 1), 
 'active', -7.7956, 110.3695, 'DI Yogyakarta'),

-- East Java sample data
('PT Telkomsel Surabaya', 'jasa', 'Penyelenggara Jasa Internet', 'TEL-SBY-008', '2023-01-30', 
 (SELECT id FROM provinces WHERE name = 'Jawa Timur' LIMIT 1), 
 (SELECT id FROM kabupaten WHERE name = 'Surabaya' LIMIT 1), 
 'active', -7.2575, 112.7521, 'Jawa Timur'),

('PT XL Malang', 'jasa', 'Penyelenggara Jasa Internet', 'XL-MLG-009', '2023-04-20', 
 (SELECT id FROM provinces WHERE name = 'Jawa Timur' LIMIT 1), 
 (SELECT id FROM kabupaten WHERE name = 'Malang' LIMIT 1), 
 'active', -7.9797, 112.6304, 'Jawa Timur'),

-- Sumatra sample data
('PT Indosat Medan', 'jasa', 'Penyelenggara Jasa Internet', 'IND-MDN-010', '2023-02-05', 
 (SELECT id FROM provinces WHERE name = 'Sumatera Utara' LIMIT 1), 
 (SELECT id FROM kabupaten WHERE name = 'Medan' LIMIT 1), 
 'active', 3.5952, 98.6722, 'Sumatera Utara'),

('PT Smartfren Palembang', 'jasa', 'Penyelenggara Jasa Internet', 'SMT-PLG-011', '2023-03-15', 
 (SELECT id FROM provinces WHERE name = 'Sumatera Selatan' LIMIT 1), 
 (SELECT id FROM kabupaten WHERE name = 'Palembang' LIMIT 1), 
 'active', -2.9761, 104.7754, 'Sumatera Selatan'),

-- Kalimantan sample data
('PT Tri Balikpapan', 'jasa', 'Penyelenggara Jasa Internet', 'TRI-BPP-012', '2023-01-20', 
 (SELECT id FROM provinces WHERE name = 'Kalimantan Timur' LIMIT 1), 
 (SELECT id FROM kabupaten WHERE name = 'Balikpapan' LIMIT 1), 
 'active', -1.2379, 116.8529, 'Kalimantan Timur'),

('PT Telkomsel Pontianak', 'jasa', 'Penyelenggara Jasa Internet', 'TEL-PTK-013', '2023-04-10', 
 (SELECT id FROM provinces WHERE name = 'Kalimantan Barat' LIMIT 1), 
 (SELECT id FROM kabupaten WHERE name = 'Pontianak' LIMIT 1), 
 'active', -0.0263, 109.3425, 'Kalimantan Barat'),

-- Sulawesi sample data
('PT XL Makassar', 'jasa', 'Penyelenggara Jasa Internet', 'XL-MKS-014', '2023-02-25', 
 (SELECT id FROM provinces WHERE name = 'Sulawesi Selatan' LIMIT 1), 
 (SELECT id FROM kabupaten WHERE name = 'Makassar' LIMIT 1), 
 'active', -5.1477, 119.4327, 'Sulawesi Selatan'),

('PT Indosat Manado', 'jasa', 'Penyelenggara Jasa Internet', 'IND-MND-015', '2023-03-20', 
 (SELECT id FROM provinces WHERE name = 'Sulawesi Utara' LIMIT 1), 
 (SELECT id FROM kabupaten WHERE name = 'Manado' LIMIT 1), 
 'active', 1.4748, 124.8421, 'Sulawesi Utara'),

-- Papua sample data
('PT Smartfren Jayapura', 'jasa', 'Penyelenggara Jasa Internet', 'SMT-JPR-016', '2023-04-05', 
 (SELECT id FROM provinces WHERE name = 'Papua' LIMIT 1), 
 (SELECT id FROM kabupaten WHERE name = 'Jayapura' LIMIT 1), 
 'active', -2.5489, 140.7077, 'Papua'),

-- Bali sample data
('PT Tri Denpasar', 'jasa', 'Penyelenggara Jasa Internet', 'TRI-DPS-017', '2023-01-10', 
 (SELECT id FROM provinces WHERE name = 'Bali' LIMIT 1), 
 (SELECT id FROM kabupaten WHERE name = 'Denpasar' LIMIT 1), 
 'active', -8.6500, 115.2167, 'Bali'),

-- Additional diverse service types
('PT Network Provider Surakarta', 'jaringan', 'Penyelenggara Jaringan Tetap Tertutup', 'NET-SKR-018', '2023-02-15', 
 (SELECT id FROM provinces WHERE name = 'Jawa Tengah' LIMIT 1), 
 (SELECT id FROM kabupaten WHERE name = 'Surakarta' LIMIT 1), 
 'active', -7.5755, 110.8243, 'Jawa Tengah'),

('PT Telecom Infrastructure Batam', 'jaringan', 'Penyelenggara Jaringan Bergerak Seluler', 'TEL-BTM-019', '2023-03-25', 
 (SELECT id FROM provinces WHERE name = 'Kepulauan Riau' LIMIT 1), 
 (SELECT id FROM kabupaten WHERE name = 'Batam' LIMIT 1), 
 'active', 1.1304, 104.0530, 'Kepulauan Riau'),

('PT Digital Services Lombok', 'jasa', 'Penyelenggara Jasa Akses Internet', 'DIG-LMB-020', '2023-04-30', 
 (SELECT id FROM provinces WHERE name = 'Nusa Tenggara Barat' LIMIT 1), 
 (SELECT id FROM kabupaten WHERE name = 'Mataram' LIMIT 1), 
 'active', -8.5833, 116.1167, 'Nusa Tenggara Barat'),

-- More recent entries for trend analysis
('PT Future Tech Tangerang', 'jasa', 'Penyelenggara Jasa Internet', 'FUT-TNG-021', '2024-01-15', 
 (SELECT id FROM provinces WHERE name = 'Banten' LIMIT 1), 
 (SELECT id FROM kabupaten WHERE name = 'Tangerang' LIMIT 1), 
 'active', -6.1783, 106.6319, 'Banten'),

('PT Innovative Comms Cirebon', 'jaringan', 'Penyelenggara Jaringan Tetap Lokal', 'INN-CRB-022', '2024-02-10', 
 (SELECT id FROM provinces WHERE name = 'Jawa Barat' LIMIT 1), 
 (SELECT id FROM kabupaten WHERE name = 'Cirebon' LIMIT 1), 
 'active', -6.7063, 108.5571, 'Jawa Barat'),

('PT Next Gen Networks Padang', 'jasa', 'Penyelenggara Jasa Internet', 'NGN-PDG-023', '2024-03-05', 
 (SELECT id FROM provinces WHERE name = 'Sumatera Barat' LIMIT 1), 
 (SELECT id FROM kabupaten WHERE name = 'Padang' LIMIT 1), 
 'active', -0.9471, 100.4172, 'Sumatera Barat'),

-- Some inactive/suspended entries for status diversity
('PT Legacy Systems Banjarmasin', 'jasa', 'Penyelenggara Jasa Internet', 'LEG-BJM-024', '2022-12-20', 
 (SELECT id FROM provinces WHERE name = 'Kalimantan Selatan' LIMIT 1), 
 (SELECT id FROM kabupaten WHERE name = 'Banjarmasin' LIMIT 1), 
 'inactive', -3.3194, 114.5906, 'Kalimantan Selatan'),

('PT Temporary Service Pekanbaru', 'jaringan', 'Penyelenggara Jaringan Bergerak Seluler', 'TMP-PKU-025', '2023-06-15', 
 (SELECT id FROM provinces WHERE name = 'Riau' LIMIT 1), 
 (SELECT id FROM kabupaten WHERE name = 'Pekanbaru' LIMIT 1), 
 'suspended', 0.5072, 101.4478, 'Riau');