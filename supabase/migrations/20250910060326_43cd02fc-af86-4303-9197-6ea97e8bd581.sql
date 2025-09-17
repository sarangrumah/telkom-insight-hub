-- Fix the ambiguous column reference in get_companies_for_management function
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
    SELECT pic.company_id, COUNT(*) as pic_count
    FROM public.person_in_charge pic
    GROUP BY pic.company_id
  ) pic_counts ON c.id = pic_counts.company_id
  LEFT JOIN (
    SELECT cd.company_id, COUNT(*) as document_count
    FROM public.company_documents cd
    GROUP BY cd.company_id
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