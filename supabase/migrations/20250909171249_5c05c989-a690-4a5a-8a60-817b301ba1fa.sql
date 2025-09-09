-- Fix missing RLS policies for new tables

-- Additional RLS policies for company_documents
CREATE POLICY "Company admins can update their company documents" ON public.company_documents
FOR UPDATE USING (
  company_id IN (
    SELECT user_profiles.company_id 
    FROM user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.is_company_admin = true
  )
);

CREATE POLICY "Company admins can delete their company documents" ON public.company_documents
FOR DELETE USING (
  company_id IN (
    SELECT user_profiles.company_id 
    FROM user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.is_company_admin = true
  )
);

-- Additional RLS policies for pic_documents
CREATE POLICY "Company admins can update PIC documents" ON public.pic_documents
FOR UPDATE USING (
  pic_id IN (
    SELECT pic.id 
    FROM person_in_charge pic
    JOIN user_profiles up ON pic.company_id = up.company_id
    WHERE up.user_id = auth.uid() 
    AND up.is_company_admin = true
  )
);

CREATE POLICY "Company admins can delete PIC documents" ON public.pic_documents
FOR DELETE USING (
  pic_id IN (
    SELECT pic.id 
    FROM person_in_charge pic
    JOIN user_profiles up ON pic.company_id = up.company_id
    WHERE up.user_id = auth.uid() 
    AND up.is_company_admin = true
  )
);

-- Additional RLS policies for person_in_charge
CREATE POLICY "Company admins can insert PIC" ON public.person_in_charge
FOR INSERT WITH CHECK (
  company_id IN (
    SELECT user_profiles.company_id 
    FROM user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.is_company_admin = true
  )
);

-- Admin policies for all new tables
CREATE POLICY "Admins can manage all company documents" ON public.company_documents
FOR ALL USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'internal_admin'::app_role)
);

CREATE POLICY "Admins can manage all PIC records" ON public.person_in_charge
FOR ALL USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'internal_admin'::app_role)
);

CREATE POLICY "Admins can manage all PIC documents" ON public.pic_documents
FOR ALL USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'internal_admin'::app_role)
);