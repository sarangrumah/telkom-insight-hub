-- Insert sample kecamatan data for Jakarta Pusat (01.71.01)
INSERT INTO indonesian_regions (region_id, name, type, parent_id) VALUES
('01.71.01.01', 'Gambir', 'kecamatan', '01.71.01'),
('01.71.01.02', 'Sawah Besar', 'kecamatan', '01.71.01'),
('01.71.01.03', 'Kemayoran', 'kecamatan', '01.71.01'),
('01.71.01.04', 'Senen', 'kecamatan', '01.71.01'),
('01.71.01.05', 'Cempaka Putih', 'kecamatan', '01.71.01'),
('01.71.01.06', 'Menteng', 'kecamatan', '01.71.01'),
('01.71.01.07', 'Tanah Abang', 'kecamatan', '01.71.01'),
('01.71.01.08', 'Johar Baru', 'kecamatan', '01.71.01');

-- Insert sample kecamatan data for Jakarta Selatan (01.71.02)
INSERT INTO indonesian_regions (region_id, name, type, parent_id) VALUES
('01.71.02.01', 'Jagakarsa', 'kecamatan', '01.71.02'),
('01.71.02.02', 'Pasar Minggu', 'kecamatan', '01.71.02'),
('01.71.02.03', 'Cilandak', 'kecamatan', '01.71.02'),
('01.71.02.04', 'Pesanggrahan', 'kecamatan', '01.71.02'),
('01.71.02.05', 'Kebayoran Lama', 'kecamatan', '01.71.02'),
('01.71.02.06', 'Kebayoran Baru', 'kecamatan', '01.71.02'),
('01.71.02.07', 'Mampang Prapatan', 'kecamatan', '01.71.02'),
('01.71.02.08', 'Pancoran', 'kecamatan', '01.71.02'),
('01.71.02.09', 'Tebet', 'kecamatan', '01.71.02'),
('01.71.02.10', 'Setia Budi', 'kecamatan', '01.71.02');

-- Insert sample kelurahan for Gambir kecamatan
INSERT INTO indonesian_regions (region_id, name, type, parent_id) VALUES
('01.71.01.01.01', 'Gambir', 'kelurahan', '01.71.01.01'),
('01.71.01.01.02', 'Cideng', 'kelurahan', '01.71.01.01'),
('01.71.01.01.03', 'Petojo Selatan', 'kelurahan', '01.71.01.01'),
('01.71.01.01.04', 'Duri Pulo', 'kelurahan', '01.71.01.01'),
('01.71.01.01.05', 'Kebon Kelapa', 'kelurahan', '01.71.01.01'),
('01.71.01.01.06', 'Petojo Utara', 'kelurahan', '01.71.01.01');

-- Insert sample kelurahan for Menteng kecamatan
INSERT INTO indonesian_regions (region_id, name, type, parent_id) VALUES
('01.71.01.06.01', 'Menteng', 'kelurahan', '01.71.01.06'),
('01.71.01.06.02', 'Pegangsaan', 'kelurahan', '01.71.01.06'),
('01.71.01.06.03', 'Cikini', 'kelurahan', '01.71.01.06'),
('01.71.01.06.04', 'Gondangdia', 'kelurahan', '01.71.01.06'),
('01.71.01.06.05', 'Kebon Sirih', 'kelurahan', '01.71.01.06');

-- Insert sample kelurahan for Kebayoran Baru kecamatan  
INSERT INTO indonesian_regions (region_id, name, type, parent_id) VALUES
('01.71.02.06.01', 'Senayan', 'kelurahan', '01.71.02.06'),
('01.71.02.06.02', 'Melawai', 'kelurahan', '01.71.02.06'),
('01.71.02.06.03', 'Petogogan', 'kelurahan', '01.71.02.06'),
('01.71.02.06.04', 'Gandaria Utara', 'kelurahan', '01.71.02.06'),
('01.71.02.06.05', 'Kramat Pela', 'kelurahan', '01.71.02.06'),
('01.71.02.06.06', 'Gunung', 'kelurahan', '01.71.02.06'),
('01.71.02.06.07', 'Rawa Barat', 'kelurahan', '01.71.02.06'),
('01.71.02.06.08', 'Cipete Utara', 'kelurahan', '01.71.02.06'),
('01.71.02.06.09', 'Pulo', 'kelurahan', '01.71.02.06');