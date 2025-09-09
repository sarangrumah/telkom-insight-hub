-- Insert sample Indonesian provinces with proper UUIDs
INSERT INTO provinces (id, code, name, latitude, longitude) VALUES
(gen_random_uuid(), '11', 'Aceh', 4.695135, 96.749397),
(gen_random_uuid(), '12', 'Sumatera Utara', 2.1153547, 99.5450974),
(gen_random_uuid(), '13', 'Sumatera Barat', -0.7399397, 100.8000051),
(gen_random_uuid(), '14', 'Riau', 0.2933469, 101.7068294),
(gen_random_uuid(), '15', 'Jambi', -1.4851831, 102.4380581),
(gen_random_uuid(), '16', 'Sumatera Selatan', -3.3194374, 103.914399),
(gen_random_uuid(), '17', 'Bengkulu', -3.8004444, 102.2655666),
(gen_random_uuid(), '18', 'Lampung', -4.5585849, 105.4068079),
(gen_random_uuid(), '19', 'Kepulauan Bangka Belitung', -2.7410513, 106.4405872),
(gen_random_uuid(), '21', 'Kepulauan Riau', 3.9456514, 108.1428669);

-- Store Jakarta province ID for reference
DO $$
DECLARE
    jakarta_id uuid;
    jabar_id uuid;
BEGIN
    -- Insert DKI Jakarta and store its ID
    INSERT INTO provinces (id, code, name, latitude, longitude) 
    VALUES (gen_random_uuid(), '31', 'DKI Jakarta', -6.211544, 106.845172)
    RETURNING id INTO jakarta_id;
    
    -- Insert Jawa Barat and store its ID
    INSERT INTO provinces (id, code, name, latitude, longitude) 
    VALUES (gen_random_uuid(), '32', 'Jawa Barat', -6.914744, 107.609810)
    RETURNING id INTO jabar_id;
    
    -- Insert more provinces
    INSERT INTO provinces (id, code, name, latitude, longitude) VALUES
    (gen_random_uuid(), '33', 'Jawa Tengah', -7.150975, 110.1402594),
    (gen_random_uuid(), '34', 'DI Yogyakarta', -7.756554, 110.4105356),
    (gen_random_uuid(), '35', 'Jawa Timur', -7.5360639, 112.2384017),
    (gen_random_uuid(), '36', 'Banten', -6.4058172, 106.0640179),
    (gen_random_uuid(), '51', 'Bali', -8.4095178, 115.188916),
    (gen_random_uuid(), '52', 'Nusa Tenggara Barat', -8.6529334, 117.3616476),
    (gen_random_uuid(), '53', 'Nusa Tenggara Timur', -8.6573819, 121.0793705),
    (gen_random_uuid(), '61', 'Kalimantan Barat', -0.2787808, 111.4752851);
    
    -- Insert kabupaten/kota for DKI Jakarta
    INSERT INTO kabupaten (id, province_id, code, name, type, latitude, longitude) VALUES
    (gen_random_uuid(), jakarta_id, '3101', 'Kepulauan Seribu', 'kabupaten', -5.6900017, 106.4700017),
    (gen_random_uuid(), jakarta_id, '3171', 'Jakarta Selatan', 'kota', -6.2614927, 106.8105998),
    (gen_random_uuid(), jakarta_id, '3172', 'Jakarta Timur', 'kota', -6.2087634, 106.899603),  
    (gen_random_uuid(), jakarta_id, '3173', 'Jakarta Pusat', 'kota', -6.1805168, 106.8283829),
    (gen_random_uuid(), jakarta_id, '3174', 'Jakarta Barat', 'kota', -6.1352, 106.813301),
    (gen_random_uuid(), jakarta_id, '3175', 'Jakarta Utara', 'kota', -6.138414, 106.863956);

    -- Insert kabupaten/kota for Jawa Barat
    INSERT INTO kabupaten (id, province_id, code, name, type, latitude, longitude) VALUES
    (gen_random_uuid(), jabar_id, '3201', 'Bogor', 'kabupaten', -6.5971469, 106.7894179),
    (gen_random_uuid(), jabar_id, '3271', 'Bogor', 'kota', -6.5971469, 106.7894179),
    (gen_random_uuid(), jabar_id, '3202', 'Sukabumi', 'kabupaten', -6.9174639, 106.9308149),
    (gen_random_uuid(), jabar_id, '3203', 'Cianjur', 'kabupaten', -6.8168, 107.1426),
    (gen_random_uuid(), jabar_id, '3204', 'Bandung', 'kabupaten', -7.0051, 107.5619),
    (gen_random_uuid(), jabar_id, '3273', 'Bandung', 'kota', -6.9034443, 107.6180747);
    
    -- Insert sample kecamatan and kelurahan for Jakarta Selatan (using code as parent_id)
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
    
END $$;