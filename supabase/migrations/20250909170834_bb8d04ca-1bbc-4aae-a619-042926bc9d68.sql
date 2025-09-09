-- Enhanced Registration Schema
-- Create enum for document types
CREATE TYPE public.document_type AS ENUM (
  'nib',
  'npwp',
  'akta',
  'ktp',
  'assignment_letter'
);

-- Create enum for company types
CREATE TYPE public.company_type AS ENUM (
  'pt',
  'cv',
  'ud',
  'koperasi',
  'yayasan',
  'other'
);

-- Update companies table with comprehensive fields
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS nib_number TEXT UNIQUE;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS npwp_number TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS company_type public.company_type;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS akta_number TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS province_id UUID REFERENCES public.provinces(id);
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS kabupaten_id UUID REFERENCES public.kabupaten(id);
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS kecamatan TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS kelurahan TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS postal_code TEXT;

-- Create company_documents table
CREATE TABLE IF NOT EXISTS public.company_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  document_type public.document_type NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'application/pdf',
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(company_id, document_type)
);

-- Create person_in_charge (PIC) table  
CREATE TABLE IF NOT EXISTS public.person_in_charge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  id_number TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  position TEXT NOT NULL,
  province_id UUID REFERENCES public.provinces(id),
  kabupaten_id UUID REFERENCES public.kabupaten(id),
  kecamatan TEXT,
  kelurahan TEXT,
  postal_code TEXT,
  address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create PIC documents table
CREATE TABLE IF NOT EXISTS public.pic_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pic_id UUID NOT NULL REFERENCES public.person_in_charge(id) ON DELETE CASCADE,
  document_type public.document_type NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'application/pdf',
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(pic_id, document_type)
);

-- Add maksud_tujuan (purpose) field to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS maksud_tujuan TEXT;

-- Enable RLS on new tables
ALTER TABLE public.company_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.person_in_charge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pic_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for company_documents
CREATE POLICY "Users can view documents from their company" ON public.company_documents
FOR SELECT USING (
  company_id IN (
    SELECT user_profiles.company_id 
    FROM user_profiles 
    WHERE user_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Company admins can insert documents" ON public.company_documents
FOR INSERT WITH CHECK (
  company_id IN (
    SELECT user_profiles.company_id 
    FROM user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.is_company_admin = true
  )
  AND uploaded_by = auth.uid()
);

-- RLS policies for person_in_charge
CREATE POLICY "Users can view PIC from their company" ON public.person_in_charge
FOR SELECT USING (
  company_id IN (
    SELECT user_profiles.company_id 
    FROM user_profiles 
    WHERE user_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Company admins can manage PIC" ON public.person_in_charge
FOR ALL USING (
  company_id IN (
    SELECT user_profiles.company_id 
    FROM user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.is_company_admin = true
  )
);

-- RLS policies for pic_documents  
CREATE POLICY "Users can view PIC documents from their company" ON public.pic_documents
FOR SELECT USING (
  pic_id IN (
    SELECT pic.id 
    FROM person_in_charge pic
    JOIN user_profiles up ON pic.company_id = up.company_id
    WHERE up.user_id = auth.uid()
  )
);

CREATE POLICY "Company admins can insert PIC documents" ON public.pic_documents
FOR INSERT WITH CHECK (
  pic_id IN (
    SELECT pic.id 
    FROM person_in_charge pic
    JOIN user_profiles up ON pic.company_id = up.company_id
    WHERE up.user_id = auth.uid() 
    AND up.is_company_admin = true
  )
  AND uploaded_by = auth.uid()
);

-- Create triggers for updated_at
CREATE TRIGGER update_company_documents_updated_at
  BEFORE UPDATE ON public.company_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_person_in_charge_updated_at
  BEFORE UPDATE ON public.person_in_charge
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pic_documents_updated_at
  BEFORE UPDATE ON public.pic_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_company_documents_company_id ON public.company_documents(company_id);
CREATE INDEX IF NOT EXISTS idx_person_in_charge_company_id ON public.person_in_charge(company_id);
CREATE INDEX IF NOT EXISTS idx_pic_documents_pic_id ON public.pic_documents(pic_id);
CREATE INDEX IF NOT EXISTS idx_companies_nib_number ON public.companies(nib_number);
CREATE INDEX IF NOT EXISTS idx_companies_npwp_number ON public.companies(npwp_number);