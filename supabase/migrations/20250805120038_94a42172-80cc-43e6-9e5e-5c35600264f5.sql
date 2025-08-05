-- Create provinces table for Indonesian administrative divisions
CREATE TABLE public.provinces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create kabupaten table for Indonesian cities/regencies
CREATE TABLE public.kabupaten (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  province_id UUID NOT NULL REFERENCES provinces(id),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('kabupaten', 'kota')),
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on provinces table
ALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;

-- Create policies for provinces (public read access)
CREATE POLICY "Anyone can view provinces" 
ON public.provinces 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage provinces" 
ON public.provinces 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'internal_admin'::app_role));

-- Enable RLS on kabupaten table
ALTER TABLE public.kabupaten ENABLE ROW LEVEL SECURITY;

-- Create policies for kabupaten (public read access)
CREATE POLICY "Anyone can view kabupaten" 
ON public.kabupaten 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage kabupaten" 
ON public.kabupaten 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'internal_admin'::app_role));

-- Add province_id and kabupaten_id to telekom_data table
ALTER TABLE public.telekom_data 
ADD COLUMN province_id UUID REFERENCES provinces(id),
ADD COLUMN kabupaten_id UUID REFERENCES kabupaten(id);

-- Create indexes for better performance
CREATE INDEX idx_kabupaten_province_id ON public.kabupaten(province_id);
CREATE INDEX idx_telekom_data_province_id ON public.telekom_data(province_id);
CREATE INDEX idx_telekom_data_kabupaten_id ON public.telekom_data(kabupaten_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_provinces_updated_at
BEFORE UPDATE ON public.provinces
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kabupaten_updated_at
BEFORE UPDATE ON public.kabupaten
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert Indonesian provinces with coordinates
INSERT INTO public.provinces (code, name, latitude, longitude) VALUES
('11', 'Aceh', 4.695135, 96.7493993),
('12', 'Sumatera Utara', 2.1153547, 99.5450974),
('13', 'Sumatera Barat', -0.7399397, 100.8000051),
('14', 'Riau', 0.2933469, 101.7068294),
('15', 'Jambi', -1.4851831, 102.4380581),
('16', 'Sumatera Selatan', -3.3194374, 103.914399),
('17', 'Bengkulu', -3.8004444, 102.2655435),
('18', 'Lampung', -4.5585849, 105.4068079),
('19', 'Kepulauan Bangka Belitung', -2.7410513, 106.4405872),
('21', 'Kepulauan Riau', 3.9456514, 108.1428669),
('31', 'DKI Jakarta', -6.211544, 106.845172),
('32', 'Jawa Barat', -6.914744, 107.609344),
('33', 'Jawa Tengah', -7.150975, 110.1402594),
('34', 'DI Yogyakarta', -7.8753849, 110.4262088),
('35', 'Jawa Timur', -7.5360639, 112.2384017),
('36', 'Banten', -6.4058172, 106.0640179),
('51', 'Bali', -8.4095178, 115.188916),
('52', 'Nusa Tenggara Barat', -8.6529334, 117.3616476),
('53', 'Nusa Tenggara Timur', -8.6573819, 121.0793705),
('61', 'Kalimantan Barat', -0.2787808, 111.4752851),
('62', 'Kalimantan Tengah', -1.6814878, 113.3823545),
('63', 'Kalimantan Selatan', -3.0926415, 115.2837585),
('64', 'Kalimantan Timur', 1.6406296, 116.419389),
('65', 'Kalimantan Utara', 2.72882, 117.1397),
('71', 'Sulawesi Utara', 1.2379274, 124.8413916),
('72', 'Sulawesi Tengah', -1.4300254, 121.4456179),
('73', 'Sulawesi Selatan', -3.6687994, 119.9740534),
('74', 'Sulawesi Tenggara', -4.14491, 122.174605),
('75', 'Gorontalo', 0.6999372, 122.4467238),
('76', 'Sulawesi Barat', -2.8441371, 119.2320784),
('81', 'Maluku', -3.2384616, 130.1452734),
('82', 'Maluku Utara', 1.5709993, 127.8087693),
('91', 'Papua Barat', -1.3361154, 133.1747162),
('94', 'Papua', -4.269928, 138.0803529);

-- Insert major kabupaten/kota with coordinates
INSERT INTO public.kabupaten (province_id, code, name, type, latitude, longitude) VALUES
-- DKI Jakarta
((SELECT id FROM provinces WHERE code = '31'), '3171', 'Jakarta Selatan', 'kota', -6.2614927, 106.8105998),
((SELECT id FROM provinces WHERE code = '31'), '3172', 'Jakarta Timur', 'kota', -6.2249396, 106.9004281),
((SELECT id FROM provinces WHERE code = '31'), '3173', 'Jakarta Pusat', 'kota', -6.1805149, 106.8283583),
((SELECT id FROM provinces WHERE code = '31'), '3174', 'Jakarta Barat', 'kota', -6.1352, 106.813301),
((SELECT id FROM provinces WHERE code = '31'), '3175', 'Jakarta Utara', 'kota', -6.138414, 106.863956),

-- Jawa Barat
((SELECT id FROM provinces WHERE code = '32'), '3273', 'Bandung', 'kota', -6.9174639, 107.6191228),
((SELECT id FROM provinces WHERE code = '32'), '3204', 'Bandung', 'kabupaten', -7.0051453, 107.5587606),
((SELECT id FROM provinces WHERE code = '32'), '3276', 'Depok', 'kota', -6.4025124, 106.7942276),
((SELECT id FROM provinces WHERE code = '32'), '3201', 'Bogor', 'kabupaten', -6.595038, 106.816635),
((SELECT id FROM provinces WHERE code = '32'), '3271', 'Bogor', 'kota', -6.5971469, 106.8060388),

-- Jawa Tengah  
((SELECT id FROM provinces WHERE code = '33'), '3374', 'Semarang', 'kota', -6.9932571, 110.4203043),
((SELECT id FROM provinces WHERE code = '33'), '3326', 'Semarang', 'kabupaten', -7.1462, 110.4985),
((SELECT id FROM provinces WHERE code = '33'), '3372', 'Surakarta', 'kota', -7.5755049, 110.8243272),

-- Jawa Timur
((SELECT id FROM provinces WHERE code = '35'), '3578', 'Surabaya', 'kota', -7.2459717, 112.7378266),
((SELECT id FROM provinces WHERE code = '35'), '3573', 'Malang', 'kota', -7.9666204, 112.6326321),
((SELECT id FROM provinces WHERE code = '35'), '3563', 'Malang', 'kabupaten', -8.1844791, 112.6304102),

-- Sumatera Utara
((SELECT id FROM provinces WHERE code = '12'), '1271', 'Medan', 'kota', 3.5951956, 98.6722227),
((SELECT id FROM provinces WHERE code = '12'), '1275', 'Binjai', 'kota', 3.6001, 98.4854),

-- Sumatera Barat
((SELECT id FROM provinces WHERE code = '13'), '1371', 'Padang', 'kota', -0.9471389, 100.4172436),

-- Riau
((SELECT id FROM provinces WHERE code = '14'), '1471', 'Pekanbaru', 'kota', 0.5070718, 101.4477932),

-- Sumatera Selatan
((SELECT id FROM provinces WHERE code = '16'), '1671', 'Palembang', 'kota', -2.9760735, 104.7754307),

-- Lampung
((SELECT id FROM provinces WHERE code = '18'), '1871', 'Bandar Lampung', 'kota', -5.3971038, 105.2668038),

-- Bali
((SELECT id FROM provinces WHERE code = '51'), '5171', 'Denpasar', 'kota', -8.6704582, 115.2126293),

-- Sulawesi Selatan
((SELECT id FROM provinces WHERE code = '73'), '7371', 'Makassar', 'kota', -5.1476651, 119.4327314),

-- Kalimantan Timur
((SELECT id FROM provinces WHERE code = '64'), '6472', 'Balikpapan', 'kota', -1.2379274, 116.8316051),
((SELECT id FROM provinces WHERE code = '64'), '6471', 'Samarinda', 'kota', -0.4985343, 117.1436676);