-- Create database functions for company management
CREATE OR REPLACE FUNCTION public.approve_company(
  _company_id UUID,
  _verified_by UUID,
  _notes TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user has permission to approve companies
  IF NOT (has_role(_verified_by, 'super_admin') OR has_role(_verified_by, 'internal_admin')) THEN
    RAISE EXCEPTION 'Insufficient permissions to approve companies';
  END IF;

  -- Update company status to verified
  UPDATE public.companies
  SET 
    status = 'verified',
    verified_at = now(),
    verified_by = _verified_by,
    verification_notes = _notes,
    updated_at = now()
  WHERE id = _company_id;

  -- Update associated user profiles to validated status
  UPDATE public.profiles
  SET 
    is_validated = true,
    updated_at = now()
  WHERE user_id IN (
    SELECT up.user_id 
    FROM user_profiles up 
    WHERE up.company_id = _company_id
  );
END;
$$;

-- Create function to reject company
CREATE OR REPLACE FUNCTION public.reject_company(
  _company_id UUID,
  _rejected_by UUID,
  _rejection_notes TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user has permission to reject companies
  IF NOT (has_role(_rejected_by, 'super_admin') OR has_role(_rejected_by, 'internal_admin')) THEN
    RAISE EXCEPTION 'Insufficient permissions to reject companies';
  END IF;

  -- Update company status to rejected
  UPDATE public.companies
  SET 
    status = 'rejected',
    verified_by = _rejected_by,
    verification_notes = _rejection_notes,
    updated_at = now()
  WHERE id = _company_id;
END;
$$;

-- Create function to get companies with details for management
CREATE OR REPLACE FUNCTION public.get_companies_for_management()
RETURNS TABLE(
  company_id UUID,
  company_name TEXT,
  email TEXT,
  phone TEXT,
  nib_number TEXT,
  npwp_number TEXT,
  akta_number TEXT,
  status company_status,
  created_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID,
  verification_notes TEXT,
  verifier_name TEXT,
  pic_count BIGINT,
  document_count BIGINT
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as company_id,
    c.company_name,
    c.email,
    c.phone,
    c.nib_number,
    c.npwp_number,
    c.akta_number,
    c.status,
    c.created_at,
    c.verified_at,
    c.verified_by,
    c.verification_notes,
    p.full_name as verifier_name,
    COALESCE(pic_counts.pic_count, 0) as pic_count,
    COALESCE(doc_counts.document_count, 0) as document_count
  FROM public.companies c
  LEFT JOIN public.profiles p ON c.verified_by = p.user_id
  LEFT JOIN (
    SELECT company_id, COUNT(*) as pic_count
    FROM public.person_in_charge
    GROUP BY company_id
  ) pic_counts ON c.id = pic_counts.company_id
  LEFT JOIN (
    SELECT company_id, COUNT(*) as document_count
    FROM public.company_documents
    GROUP BY company_id
  ) doc_counts ON c.id = doc_counts.company_id
  ORDER BY 
    CASE c.status 
      WHEN 'pending_verification' THEN 1
      WHEN 'verified' THEN 2
      WHEN 'rejected' THEN 3
      ELSE 4
    END,
    c.created_at DESC;
END;
$$;

-- Add RLS policies for company management functions
CREATE POLICY "Admins can call company management functions"
ON public.companies
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'internal_admin'));