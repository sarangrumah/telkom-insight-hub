-- Insert sample kecamatan data for Jakarta Pusat (01.71.01)
INSERT INTO indonesian_regions (region_id, name, type, parent_id) VALUES
('0171010101', 'Gambir', 'kecamatan', '01.71.01'),
('0171010102', 'Sawah Besar', 'kecamatan', '01.71.01'),
('0171010103', 'Kemayoran', 'kecamatan', '01.71.01'),
('0171010104', 'Senen', 'kecamatan', '01.71.01'),
('0171010105', 'Cempaka Putih', 'kecamatan', '01.71.01'),
('0171010106', 'Menteng', 'kecamatan', '01.71.01'),
('0171010107', 'Tanah Abang', 'kecamatan', '01.71.01'),
('0171010108', 'Johar Baru', 'kecamatan', '01.71.01');

-- Insert sample kecamatan data for Jakarta Selatan (01.71.02)
INSERT INTO indonesian_regions (region_id, name, type, parent_id) VALUES
('0171020101', 'Jagakarsa', 'kecamatan', '01.71.02'),
('0171020102', 'Pasar Minggu', 'kecamatan', '01.71.02'),
('0171020103', 'Cilandak', 'kecamatan', '01.71.02'),
('0171020104', 'Pesanggrahan', 'kecamatan', '01.71.02'),
('0171020105', 'Kebayoran Lama', 'kecamatan', '01.71.02'),
('0171020106', 'Kebayoran Baru', 'kecamatan', '01.71.02'),
('0171020107', 'Mampang Prapatan', 'kecamatan', '01.71.02'),
('0171020108', 'Pancoran', 'kecamatan', '01.71.02'),
('0171020109', 'Tebet', 'kecamatan', '01.71.02'),
('0171020110', 'Setia Budi', 'kecamatan', '01.71.02');

-- Insert sample kelurahan for Gambir kecamatan
INSERT INTO indonesian_regions (region_id, name, type, parent_id) VALUES
('0171010111', 'Gambir', 'kelurahan', '0171010101'),
('0171010112', 'Cideng', 'kelurahan', '0171010101'),
('0171010113', 'Petojo Selatan', 'kelurahan', '0171010101'),
('0171010114', 'Duri Pulo', 'kelurahan', '0171010101'),
('0171010115', 'Kebon Kelapa', 'kelurahan', '0171010101'),
('0171010116', 'Petojo Utara', 'kelurahan', '0171010101');

-- Insert sample kelurahan for Menteng kecamatan
INSERT INTO indonesian_regions (region_id, name, type, parent_id) VALUES
('0171010611', 'Menteng', 'kelurahan', '0171010106'),
('0171010612', 'Pegangsaan', 'kelurahan', '0171010106'),
('0171010613', 'Cikini', 'kelurahan', '0171010106'),
('0171010614', 'Gondangdia', 'kelurahan', '0171010106'),
('0171010615', 'Kebon Sirih', 'kelurahan', '0171010106');

-- Insert sample kelurahan for Kebayoran Baru kecamatan  
INSERT INTO indonesian_regions (region_id, name, type, parent_id) VALUES
('0171020621', 'Senayan', 'kelurahan', '0171020106'),
('0171020622', 'Melawai', 'kelurahan', '0171020106'),
('0171020623', 'Petogogan', 'kelurahan', '0171020106'),
('0171020624', 'Gandaria Utara', 'kelurahan', '0171020106'),
('0171020625', 'Kramat Pela', 'kelurahan', '0171020106'),
('0171020626', 'Gunung', 'kelurahan', '0171020106'),
('0171020627', 'Rawa Barat', 'kelurahan', '0171020106'),
('0171020628', 'Cipete Utara', 'kelurahan', '0171020106'),
('0171020629', 'Pulo', 'kelurahan', '0171020106');