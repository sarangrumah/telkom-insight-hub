-- Insert sample Indonesian provinces
INSERT INTO provinces (id, code, name, latitude, longitude) VALUES
('a1b2c3d4-e5f6-7890-1234-567890abcdef', '11', 'Aceh', 4.695135, 96.749397),
('b2c3d4e5-f6g7-8901-2345-678901bcdefg', '12', 'Sumatera Utara', 2.1153547, 99.5450974),
('c3d4e5f6-g7h8-9012-3456-789012cdefgh', '13', 'Sumatera Barat', -0.7399397, 100.8000051),
('d4e5f6g7-h8i9-0123-4567-890123defghi', '14', 'Riau', 0.2933469, 101.7068294),
('e5f6g7h8-i9j0-1234-5678-901234efghij', '15', 'Jambi', -1.4851831, 102.4380581),
('f6g7h8i9-j0k1-2345-6789-012345fghijk', '16', 'Sumatera Selatan', -3.3194374, 103.914399),
('g7h8i9j0-k1l2-3456-7890-123456ghijkl', '17', 'Bengkulu', -3.8004444, 102.2655666),
('h8i9j0k1-l2m3-4567-8901-234567hijklm', '18', 'Lampung', -4.5585849, 105.4068079),
('i9j0k1l2-m3n4-5678-9012-345678ijklmn', '19', 'Kepulauan Bangka Belitung', -2.7410513, 106.4405872),
('j0k1l2m3-n4o5-6789-0123-456789jklmno', '21', 'Kepulauan Riau', 3.9456514, 108.1428669),
('k1l2m3n4-o5p6-7890-1234-567890klmnop', '31', 'DKI Jakarta', -6.211544, 106.845172),
('l2m3n4o5-p6q7-8901-2345-678901lmnopq', '32', 'Jawa Barat', -6.914744, 107.609810),
('m3n4o5p6-q7r8-9012-3456-789012mnopqr', '33', 'Jawa Tengah', -7.150975, 110.1402594),
('n4o5p6q7-r8s9-0123-4567-890123nopqrs', '34', 'DI Yogyakarta', -7.756554, 110.4105356),
('o5p6q7r8-s9t0-1234-5678-901234opqrst', '35', 'Jawa Timur', -7.5360639, 112.2384017),
('p6q7r8s9-t0u1-2345-6789-012345pqrstu', '36', 'Banten', -6.4058172, 106.0640179),
('q7r8s9t0-u1v2-3456-7890-123456qrstuv', '51', 'Bali', -8.4095178, 115.188916),
('r8s9t0u1-v2w3-4567-8901-234567rstuvw', '52', 'Nusa Tenggara Barat', -8.6529334, 117.3616476),
('s9t0u1v2-w3x4-5678-9012-345678stuvwx', '53', 'Nusa Tenggara Timur', -8.6573819, 121.0793705),
('t0u1v2w3-x4y5-6789-0123-456789tuvwxy', '61', 'Kalimantan Barat', -0.2787808, 111.4752851);

-- Insert sample kabupaten/kota for DKI Jakarta
INSERT INTO kabupaten (id, province_id, code, name, type, latitude, longitude) VALUES
('z1a2b3c4-d5e6-7890-1234-567890zabcde', 'k1l2m3n4-o5p6-7890-1234-567890klmnop', '3101', 'Kepulauan Seribu', 'kabupaten', -5.6900017, 106.4700017),
('a2b3c4d5-e6f7-8901-2345-678901abcdef', 'k1l2m3n4-o5p6-7890-1234-567890klmnop', '3171', 'Jakarta Selatan', 'kota', -6.2614927, 106.8105998),
('b3c4d5e6-f7g8-9012-3456-789012bcdefg', 'k1l2m3n4-o5p6-7890-1234-567890klmnop', '3172', 'Jakarta Timur', 'kota', -6.2087634, 106.899603),  
('c4d5e6f7-g8h9-0123-4567-890123cdefgh', 'k1l2m3n4-o5p6-7890-1234-567890klmnop', '3173', 'Jakarta Pusat', 'kota', -6.1805168, 106.8283829),
('d5e6f7g8-h9i0-1234-5678-901234defghi', 'k1l2m3n4-o5p6-7890-1234-567890klmnop', '3174', 'Jakarta Barat', 'kota', -6.1352, 106.813301),
('e6f7g8h9-i0j1-2345-6789-012345efghij', 'k1l2m3n4-o5p6-7890-1234-567890klmnop', '3175', 'Jakarta Utara', 'kota', -6.138414, 106.863956);

-- Insert sample kabupaten/kota for Jawa Barat
INSERT INTO kabupaten (id, province_id, code, name, type, latitude, longitude) VALUES
('f7g8h9i0-j1k2-3456-7890-123456fghijk', 'l2m3n4o5-p6q7-8901-2345-678901lmnopq', '3201', 'Bogor', 'kabupaten', -6.5971469, 106.7894179),
('g8h9i0j1-k2l3-4567-8901-234567ghijkl', 'l2m3n4o5-p6q7-8901-2345-678901lmnopq', '3271', 'Bogor', 'kota', -6.5971469, 106.7894179),
('h9i0j1k2-l3m4-5678-9012-345678hijklm', 'l2m3n4o5-p6q7-8901-2345-678901lmnopq', '3202', 'Sukabumi', 'kabupaten', -6.9174639, 106.9308149),
('i0j1k2l3-m4n5-6789-0123-456789ijklmn', 'l2m3n4o5-p6q7-8901-2345-678901lmnopq', '3203', 'Cianjur', 'kabupaten', -6.8168, 107.1426),
('j1k2l3m4-n5o6-7890-1234-567890jklmno', 'l2m3n4o5-p6q7-8901-2345-678901lmnopq', '3204', 'Bandung', 'kabupaten', -7.0051, 107.5619),
('k2l3m4n5-o6p7-8901-2345-678901klmnop', 'l2m3n4o5-p6q7-8901-2345-678901lmnopq', '3273', 'Bandung', 'kota', -6.9034443, 107.6180747);

-- Insert sample kecamatan and kelurahan for Jakarta Selatan
INSERT INTO indonesian_regions (id, region_id, name, type, parent_id) VALUES
-- Kecamatan in Jakarta Selatan
(gen_random_uuid(), '317101', 'Jagakarsa', 'district', '3171'),
(gen_random_uuid(), '317102', 'Pasar Minggu', 'district', '3171'),
(gen_random_uuid(), '317103', 'Cilandak', 'district', '3171'),
(gen_random_uuid(), '317104', 'Pesanggrahan', 'district', '3171'),
(gen_random_uuid(), '317105', 'Kebayoran Lama', 'district', '3171'),
(gen_random_uuid(), '317106', 'Kebayoran Baru', 'district', '3171'),
(gen_random_uuid(), '317107', 'Mampang Prapatan', 'district', '3171'),
(gen_random_uuid(), '317108', 'Pancoran', 'district', '3171'),
(gen_random_uuid(), '317109', 'Tebet', 'district', '3171'),
(gen_random_uuid(), '317110', 'Setia Budi', 'district', '3171'),

-- Kelurahan in Jagakarsa
(gen_random_uuid(), '31710101', 'Jagakarsa', 'village', '317101'),
(gen_random_uuid(), '31710102', 'Tanjung Barat', 'village', '317101'),
(gen_random_uuid(), '31710103', 'Lenteng Agung', 'village', '317101'),
(gen_random_uuid(), '31710104', 'Cipedak', 'village', '317101'),
(gen_random_uuid(), '31710105', 'Srengseng Sawah', 'village', '317101'),

-- Kelurahan in Kebayoran Baru  
(gen_random_uuid(), '31710601', 'Kramat Pela', 'village', '317106'),
(gen_random_uuid(), '31710602', 'Gandaria Utara', 'village', '317106'),
(gen_random_uuid(), '31710603', 'Cipete Utara', 'village', '317106'),
(gen_random_uuid(), '31710604', 'Pulo', 'village', '317106'),
(gen_random_uuid(), '31710605', 'Melawai', 'village', '317106'),
(gen_random_uuid(), '31710606', 'Petogogan', 'village', '317106'),
(gen_random_uuid(), '31710607', 'Rawa Barat', 'village', '317106'),
(gen_random_uuid(), '31710608', 'Senayan', 'village', '317106'),
(gen_random_uuid(), '31710609', 'Gunung', 'village', '317106');

-- Insert sample kecamatan and kelurahan for Bogor Kabupaten
INSERT INTO indonesian_regions (id, region_id, name, type, parent_id) VALUES
-- Kecamatan in Bogor Kabupaten
(gen_random_uuid(), '320101', 'Nanggung', 'district', '3201'),
(gen_random_uuid(), '320102', 'Leuwiliang', 'district', '3201'),
(gen_random_uuid(), '320103', 'Leuwisadeng', 'district', '3201'),
(gen_random_uuid(), '320104', 'Pamijahan', 'district', '3201'),
(gen_random_uuid(), '320105', 'Cibungbulang', 'district', '3201'),
(gen_random_uuid(), '320106', 'Ciampea', 'district', '3201'),
(gen_random_uuid(), '320107', 'Dramaga', 'district', '3201'),
(gen_random_uuid(), '320108', 'Ciomas', 'district', '3201'),
(gen_random_uuid(), '320109', 'Tamansari', 'district', '3201'),
(gen_random_uuid(), '320110', 'Cijeruk', 'district', '3201'),

-- Kelurahan in Ciampea
(gen_random_uuid(), '32010601', 'Ciampea', 'village', '320106'),
(gen_random_uuid(), '32010602', 'Cihideung Udik', 'village', '320106'),
(gen_random_uuid(), '32010603', 'Cihideung Ilir', 'village', '320106'),
(gen_random_uuid(), '32010604', 'Ciampea Udik', 'village', '320106'),
(gen_random_uuid(), '32010605', 'Bojong Rangkas', 'village', '320106'),
(gen_random_uuid(), '32010606', 'Situ Udik', 'village', '320106'),
(gen_random_uuid(), '32010607', 'Situ Ilir', 'village', '320106'),
(gen_random_uuid(), '32010608', 'Cibuntu', 'village', '320106'),
(gen_random_uuid(), '32010609', 'Benteng', 'village', '320106');

COMMENT ON TABLE provinces IS 'Sample Indonesian provinces for location selector';
COMMENT ON TABLE kabupaten IS 'Sample Indonesian kabupaten/kota for location selector';
COMMENT ON TABLE indonesian_regions IS 'Sample Indonesian regions (kecamatan and kelurahan) for location selector';