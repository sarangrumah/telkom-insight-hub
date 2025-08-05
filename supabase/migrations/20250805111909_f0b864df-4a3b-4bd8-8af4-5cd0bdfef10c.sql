-- Create services table for main service categories
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sub_services table for detailed service types
CREATE TABLE public.sub_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(service_id, code)
);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_services ENABLE ROW LEVEL SECURITY;

-- Create policies for services
CREATE POLICY "Anyone can view services" 
ON public.services 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage services" 
ON public.services 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'internal_admin'::app_role));

-- Create policies for sub_services
CREATE POLICY "Anyone can view sub_services" 
ON public.sub_services 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage sub_services" 
ON public.sub_services 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'internal_admin'::app_role));

-- Insert main services
INSERT INTO public.services (name, code, description) VALUES
('Jasa Telekomunikasi', 'jasa', 'Layanan jasa telekomunikasi'),
('Jaringan Telekomunikasi', 'jaringan', 'Infrastruktur jaringan telekomunikasi'),
('Telekomunikasi Khusus', 'telekomunikasi_khusus', 'Layanan telekomunikasi untuk keperluan khusus'),
('ISR', 'isr', 'ISR Services');

-- Insert sub_services for jasa
INSERT INTO public.sub_services (service_id, name, code) 
SELECT s.id, 'Penyelenggaraan Jasa Internet', 'PENYELENGGARAAN_JASA_INTERNET'
FROM public.services s WHERE s.code = 'jasa';

INSERT INTO public.sub_services (service_id, name, code) 
SELECT s.id, 'Jasa Akses Internet', 'JASA_AKSES_INTERNET'
FROM public.services s WHERE s.code = 'jasa';

INSERT INTO public.sub_services (service_id, name, code) 
SELECT s.id, 'Jasa Teleponi Dasar', 'JASA_TELEPONI_DASAR'
FROM public.services s WHERE s.code = 'jasa';

INSERT INTO public.sub_services (service_id, name, code) 
SELECT s.id, 'Multimedia', 'MULTIMEDIA'
FROM public.services s WHERE s.code = 'jasa';

INSERT INTO public.sub_services (service_id, name, code) 
SELECT s.id, 'Jasa Teleponi Bergerak Selular', 'JASA_TELEPONI_BERGERAK_SELULAR'
FROM public.services s WHERE s.code = 'jasa';

-- Insert sub_services for jaringan
INSERT INTO public.sub_services (service_id, name, code) 
SELECT s.id, 'Penyelenggaraan Jaringan Tetap Tertutup', 'PENYELENGGARAAN_JARINGAN_TETAP_TERTUTUP'
FROM public.services s WHERE s.code = 'jaringan';

INSERT INTO public.sub_services (service_id, name, code) 
SELECT s.id, 'Penyelenggaraan Jaringan Bergerak Selular', 'PENYELENGGARAAN_JARINGAN_BERGERAK_SELULAR'
FROM public.services s WHERE s.code = 'jaringan';

INSERT INTO public.sub_services (service_id, name, code) 
SELECT s.id, 'Penyelenggaraan Jaringan Tetap Lokal', 'PENYELENGGARAAN_JARINGAN_TETAP_LOKAL'
FROM public.services s WHERE s.code = 'jaringan';

INSERT INTO public.sub_services (service_id, name, code) 
SELECT s.id, 'Penyelenggaraan Jaringan Tetap Sambungan Langsung Jarak Jauh', 'PENYELENGGARAAN_JARINGAN_TETAP_SAMBUNGAN_LANGSUNG_JARAK_JAUH'
FROM public.services s WHERE s.code = 'jaringan';

-- Insert sub_services for telekomunikasi_khusus
INSERT INTO public.sub_services (service_id, name, code) 
SELECT s.id, 'Very Small Aperture Terminal (VSAT)', 'VERY_SMALL_APERTURE_TERMINAL_VSAT'
FROM public.services s WHERE s.code = 'telekomunikasi_khusus';

INSERT INTO public.sub_services (service_id, name, code) 
SELECT s.id, 'Penyelenggaraan Telekomunikasi Khusus untuk Keperluan Pertelevisian', 'PENYELENGGARAAN_TELEKOMUNIKASI_KHUSUS_UNTUK_KEPERLUAN_PERTELEVISIAN'
FROM public.services s WHERE s.code = 'telekomunikasi_khusus';

INSERT INTO public.sub_services (service_id, name, code) 
SELECT s.id, 'Penyelenggaraan Telekomunikasi Khusus Lainnya', 'PENYELENGGARAAN_TELEKOMUNIKASI_KHUSUS_LAINNYA'
FROM public.services s WHERE s.code = 'telekomunikasi_khusus';

-- Insert sub_services for isr
INSERT INTO public.sub_services (service_id, name, code) 
SELECT s.id, 'ISR Service', 'ISR_SERVICE'
FROM public.services s WHERE s.code = 'isr';

-- Add sub_service_id column to telekom_data
ALTER TABLE public.telekom_data ADD COLUMN sub_service_id UUID REFERENCES public.sub_services(id);

-- Migrate existing data from text-based service types to UUID references
UPDATE public.telekom_data td
SET sub_service_id = ss.id
FROM public.sub_services ss
JOIN public.services s ON ss.service_id = s.id
WHERE s.code = td.service_type::text
AND ss.name = COALESCE(td.sub_service_type, 
  CASE 
    WHEN td.service_type::text = 'jasa' THEN 'Jasa Akses Internet'
    WHEN td.service_type::text = 'jaringan' THEN 'Penyelenggaraan Jaringan Tetap Lokal'
    WHEN td.service_type::text = 'telekomunikasi_khusus' THEN 'Very Small Aperture Terminal (VSAT)'
    WHEN td.service_type::text = 'isr' THEN 'ISR Service'
  END
);

-- Create indexes for better performance
CREATE INDEX idx_sub_services_service_id ON public.sub_services(service_id);
CREATE INDEX idx_telekom_data_sub_service_id ON public.telekom_data(sub_service_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sub_services_updated_at
BEFORE UPDATE ON public.sub_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();