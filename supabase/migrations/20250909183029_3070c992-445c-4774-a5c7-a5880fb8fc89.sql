-- Delete existing sample data with wrong parent_ids
DELETE FROM indonesian_regions WHERE type IN ('kecamatan', 'kelurahan');

-- Insert sample kecamatan data for Jakarta Pusat (code: 3173)
INSERT INTO indonesian_regions (region_id, name, type, parent_id) VALUES
('3173010101', 'Gambir', 'kecamatan', '3173'),
('3173010102', 'Sawah Besar', 'kecamatan', '3173'),  
('3173010103', 'Kemayoran', 'kecamatan', '3173'),
('3173010104', 'Senen', 'kecamatan', '3173'),
('3173010105', 'Cempaka Putih', 'kecamatan', '3173'),
('3173010106', 'Menteng', 'kecamatan', '3173'),
('3173010107', 'Tanah Abang', 'kecamatan', '3173'),
('3173010108', 'Johar Baru', 'kecamatan', '3173');

-- Insert sample kecamatan data for Jakarta Selatan (code: 3171) 
INSERT INTO indonesian_regions (region_id, name, type, parent_id) VALUES
('3171010101', 'Jagakarsa', 'kecamatan', '3171'),
('3171010102', 'Pasar Minggu', 'kecamatan', '3171'),
('3171010103', 'Cilandak', 'kecamatan', '3171'),
('3171010104', 'Pesanggrahan', 'kecamatan', '3171'),
('3171010105', 'Kebayoran Lama', 'kecamatan', '3171'),
('3171010106', 'Kebayoran Baru', 'kecamatan', '3171'),
('3171010107', 'Mampang Prapatan', 'kecamatan', '3171'),
('3171010108', 'Pancoran', 'kecamatan', '3171'),
('3171010109', 'Tebet', 'kecamatan', '3171'),
('3171010110', 'Setia Budi', 'kecamatan', '3171');

-- Insert sample kelurahan for Gambir kecamatan
INSERT INTO indonesian_regions (region_id, name, type, parent_id) VALUES
('317301010111', 'Gambir', 'kelurahan', '3173010101'),
('317301010112', 'Cideng', 'kelurahan', '3173010101'),
('317301010113', 'Petojo Selatan', 'kelurahan', '3173010101'),
('317301010114', 'Duri Pulo', 'kelurahan', '3173010101'),
('317301010115', 'Kebon Kelapa', 'kelurahan', '3173010101'),
('317301010116', 'Petojo Utara', 'kelurahan', '3173010101');

-- Insert sample kelurahan for Menteng kecamatan
INSERT INTO indonesian_regions (region_id, name, type, parent_id) VALUES
('317301010611', 'Menteng', 'kelurahan', '3173010106'),
('317301010612', 'Pegangsaan', 'kelurahan', '3173010106'),
('317301010613', 'Cikini', 'kelurahan', '3173010106'),
('317301010614', 'Gondangdia', 'kelurahan', '3173010106'),
('317301010615', 'Kebon Sirih', 'kelurahan', '3173010106');

-- Insert sample kelurahan for Kebayoran Baru kecamatan  
INSERT INTO indonesian_regions (region_id, name, type, parent_id) VALUES
('317101010621', 'Senayan', 'kelurahan', '3171010106'),
('317101010622', 'Melawai', 'kelurahan', '3171010106'),
('317101010623', 'Petogogan', 'kelurahan', '3171010106'),
('317101010624', 'Gandaria Utara', 'kelurahan', '3171010106'),
('317101010625', 'Kramat Pela', 'kelurahan', '3171010106'),
('317101010626', 'Gunung', 'kelurahan', '3171010106'),
('317101010627', 'Rawa Barat', 'kelurahan', '3171010106'),
('317101010628', 'Cipete Utara', 'kelurahan', '3171010106'),
('317101010629', 'Pulo', 'kelurahan', '3171010106');