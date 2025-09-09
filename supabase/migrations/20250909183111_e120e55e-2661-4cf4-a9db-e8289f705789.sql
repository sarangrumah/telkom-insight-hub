-- Delete existing sample data with wrong parent_ids
DELETE FROM indonesian_regions WHERE type IN ('kecamatan', 'kelurahan');

-- Insert sample kecamatan data for Jakarta Pusat (code: 3173)
INSERT INTO indonesian_regions (region_id, name, type, parent_id) VALUES
('3173.01', 'Gambir', 'kecamatan', '3173'),
('3173.02', 'Sawah Besar', 'kecamatan', '3173'),  
('3173.03', 'Kemayoran', 'kecamatan', '3173'),
('3173.04', 'Senen', 'kecamatan', '3173'),
('3173.05', 'Cempaka Putih', 'kecamatan', '3173'),
('3173.06', 'Menteng', 'kecamatan', '3173'),
('3173.07', 'Tanah Abang', 'kecamatan', '3173'),
('3173.08', 'Johar Baru', 'kecamatan', '3173');

-- Insert sample kecamatan data for Jakarta Selatan (code: 3171) 
INSERT INTO indonesian_regions (region_id, name, type, parent_id) VALUES
('3171.01', 'Jagakarsa', 'kecamatan', '3171'),
('3171.02', 'Pasar Minggu', 'kecamatan', '3171'),
('3171.03', 'Cilandak', 'kecamatan', '3171'),
('3171.04', 'Pesanggrahan', 'kecamatan', '3171'),
('3171.05', 'Kebayoran Lama', 'kecamatan', '3171'),
('3171.06', 'Kebayoran Baru', 'kecamatan', '3171'),
('3171.07', 'Mampang Prapatan', 'kecamatan', '3171'),
('3171.08', 'Pancoran', 'kecamatan', '3171'),
('3171.09', 'Tebet', 'kecamatan', '3171'),
('3171.10', 'Setia Budi', 'kecamatan', '3171');

-- Insert sample kelurahan for Gambir kecamatan
INSERT INTO indonesian_regions (region_id, name, type, parent_id) VALUES
('3173.01.1', 'Gambir', 'kelurahan', '3173.01'),
('3173.01.2', 'Cideng', 'kelurahan', '3173.01'),
('3173.01.3', 'Petojo Selatan', 'kelurahan', '3173.01'),
('3173.01.4', 'Duri Pulo', 'kelurahan', '3173.01'),
('3173.01.5', 'Kebon Kelapa', 'kelurahan', '3173.01'),
('3173.01.6', 'Petojo Utara', 'kelurahan', '3173.01');

-- Insert sample kelurahan for Menteng kecamatan
INSERT INTO indonesian_regions (region_id, name, type, parent_id) VALUES
('3173.06.1', 'Menteng', 'kelurahan', '3173.06'),
('3173.06.2', 'Pegangsaan', 'kelurahan', '3173.06'),
('3173.06.3', 'Cikini', 'kelurahan', '3173.06'),
('3173.06.4', 'Gondangdia', 'kelurahan', '3173.06'),
('3173.06.5', 'Kebon Sirih', 'kelurahan', '3173.06');

-- Insert sample kelurahan for Kebayoran Baru kecamatan  
INSERT INTO indonesian_regions (region_id, name, type, parent_id) VALUES
('3171.06.1', 'Senayan', 'kelurahan', '3171.06'),
('3171.06.2', 'Melawai', 'kelurahan', '3171.06'),
('3171.06.3', 'Petogogan', 'kelurahan', '3171.06'),
('3171.06.4', 'Gandaria Utara', 'kelurahan', '3171.06'),
('3171.06.5', 'Kramat Pela', 'kelurahan', '3171.06'),
('3171.06.6', 'Gunung', 'kelurahan', '3171.06'),
('3171.06.7', 'Rawa Barat', 'kelurahan', '3171.06'),
('3171.06.8', 'Cipete Utara', 'kelurahan', '3171.06'),
('3171.06.9', 'Pulo', 'kelurahan', '3171.06');