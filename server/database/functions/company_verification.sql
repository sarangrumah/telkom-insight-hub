-- Company verification functions

-- Function to approve a company
CREATE OR REPLACE FUNCTION public.approve_company(
  _company_id UUID,
  _verified_by UUID,
  _notes TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user has permission to approve companies
  IF NOT (public.has_role(_verified_by, 'super_admin'::public.app_role) OR 
          public.has_role(_verified_by, 'internal_admin'::public.app_role)) THEN
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
    FROM public.user_profiles up 
    WHERE up.company_id = _company_id
  );

  -- Create notification ticket for the company
  INSERT INTO public.tickets (
    user_id,
    title,
    description,
    status,
    priority,
    category,
    created_at
  )
  SELECT 
    up.user_id,
    'Company Verification Approved',
    'Your company registration has been approved. You now have full access to the platform.' || 
    CASE WHEN _notes IS NOT NULL THEN ' Additional notes: ' || _notes ELSE '' END,
    'open',
    'medium',
    'verification',
    now()
  FROM public.user_profiles up
  WHERE up.company_id = _company_id;
END;
$$;

-- Function to reject a company
CREATE OR REPLACE FUNCTION public.reject_company(
  _company_id UUID,
  _rejected_by UUID,
  _rejection_notes TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user has permission to reject companies
  IF NOT (public.has_role(_rejected_by, 'super_admin'::public.app_role) OR 
          public.has_role(_rejected_by, 'internal_admin'::public.app_role)) THEN
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

  -- Create notification ticket for the company
  INSERT INTO public.tickets (
    user_id,
    title,
    description,
    status,
    priority,
    category,
    created_at
  )
  SELECT 
    up.user_id,
    'Company Registration Rejected',
    'Your company registration has been rejected. Reason: ' || _rejection_notes,
    'open',
    'high',
    'verification',
    now()
  FROM public.user_profiles up
  WHERE up.company_id = _company_id;
END;
$$;

-- Function to request company correction
CREATE OR REPLACE FUNCTION public.request_company_correction(
  _company_id UUID,
  _requested_by UUID,
  _correction_notes JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user has permission to request corrections
  IF NOT (public.has_role(_requested_by, 'super_admin'::public.app_role) OR 
          public.has_role(_requested_by, 'internal_admin'::public.app_role) OR
          public.has_role(_requested_by, 'pengolah_data'::public.app_role)) THEN
    RAISE EXCEPTION 'Insufficient permissions to request corrections';
  END IF;

  -- Update company status to needs correction
  UPDATE public.companies
  SET 
    status = 'needs_correction',
    correction_notes = _correction_notes,
    correction_status = 'pending_correction',
    updated_at = now()
  WHERE id = _company_id;

  -- Create notification ticket for the company
  INSERT INTO public.tickets (
    user_id,
    title,
    description,
    status,
    priority,
    category,
    created_at
  )
  SELECT 
    up.user_id,
    'Company Registration Needs Correction',
    'Your company registration needs correction. Please update the required information. Details: ' || _correction_notes::text,
    'open',
    'high',
    'verification',
    now()
  FROM public.user_profiles up
  WHERE up.company_id = _company_id;
END;
$$;

-- Function to submit company corrections
CREATE OR REPLACE FUNCTION public.submit_company_corrections(
  _company_id UUID,
  _submitted_by UUID,
  _updated_data JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user belongs to the company
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = _submitted_by AND company_id = _company_id
  ) THEN
    RAISE EXCEPTION 'User does not belong to this company';
  END IF;

  -- Update company data with corrections
  IF _updated_data ? 'company_name' THEN
    UPDATE public.companies SET company_name = _updated_data->>'company_name', updated_at = now() WHERE id = _company_id;
  END IF;
  
  IF _updated_data ? 'company_address' THEN
    UPDATE public.companies SET company_address = _updated_data->>'company_address', updated_at = now() WHERE id = _company_id;
  END IF;
  
  IF _updated_data ? 'email' THEN
    UPDATE public.companies SET email = _updated_data->>'email', updated_at = now() WHERE id = _company_id;
  END IF;
  
  IF _updated_data ? 'phone' THEN
    UPDATE public.companies SET phone = _updated_data->>'phone', updated_at = now() WHERE id = _company_id;
  END IF;
  
  -- Update company status back to pending verification
  UPDATE public.companies
  SET 
    status = 'pending_verification',
    correction_status = 'submitted',
    updated_at = now()
  WHERE id = _company_id AND status = 'needs_correction';

  -- Create notification ticket for the admin team
  INSERT INTO public.tickets (
    user_id,
    title,
    description,
    status,
    priority,
    category,
    created_at
  )
  SELECT 
    up.user_id,
    'Company Corrections Submitted',
    'Corrections have been submitted for company ' || (SELECT company_name FROM companies WHERE id = _company_id) || '. Please review and verify again.',
    'open',
    'medium',
    'verification',
    now()
  FROM public.user_profiles up
  WHERE up.role IN ('internal_admin', 'pengolah_data')
  LIMIT 1; -- Just pick one admin for notification
END;
$$;

-- Function to verify certificate document
CREATE OR REPLACE FUNCTION public.verify_certificate_document(
  _certificate_id UUID,
  _verified_by UUID,
  _status TEXT,
  _notes TEXT DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  certificate_id UUID,
  updated_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_role public.app_role;
  _result RECORD;
BEGIN
  -- Check if user has required role to verify certificates
  IF NOT (public.has_role(_verified_by, 'super_admin'::public.app_role) OR 
          public.has_role(_verified_by, 'internal_admin'::public.app_role)) THEN
    RAISE EXCEPTION 'Insufficient permissions to verify certificates';
  END IF;

  -- Validate status parameter
  IF _status NOT IN ('verified', 'rejected', 'needs_correction') THEN
    RAISE EXCEPTION 'Invalid status. Must be verified, rejected, or needs_correction';
  END IF;

  -- Update certificate verification status
  UPDATE public.certificate_documents
  SET 
    verification_status = _status,
    verified_at = CASE WHEN _status = 'verified' THEN now() ELSE verified_at END,
    verified_by = _verified_by,
    verification_notes = _notes,
    updated_at = now()
  WHERE id = _certificate_id;

  -- Create notification ticket for the company
  INSERT INTO public.tickets (
    user_id,
    title,
    description,
    status,
    priority,
    category,
    created_at
  )
  SELECT 
    up.user_id,
    'Certificate ' || UPPER(_status),
    'Your certificate "' || (SELECT file_name FROM certificate_documents WHERE id = _certificate_id) || 
    '" has been ' || _status || '.' ||
    CASE WHEN _notes IS NOT NULL THEN ' Notes: ' || _notes ELSE '' END,
    'open',
    CASE WHEN _status = 'rejected' THEN 'high' ELSE 'medium' END,
    'certificate_verification',
    now()
  FROM public.user_profiles up
  JOIN public.certificate_documents cd ON up.company_id = cd.company_id
  WHERE cd.id = _certificate_id
  LIMIT 1;

  -- Return success response
  RETURN QUERY
  SELECT 
    true as success,
    'Certificate verification status updated' as message,
    _certificate_id as certificate_id,
    _status as updated_status;
END;
$$;

-- Function to validate company documents
CREATE OR REPLACE FUNCTION public.validate_company_documents(
  _company_id UUID
)
RETURNS TABLE(
  is_complete BOOLEAN,
  missing_documents TEXT[],
  has_required_documents BOOLEAN,
  uploaded_documents TEXT[]
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  _required_docs TEXT[] := ARRAY['nib', 'npwp', 'akta'];
  _uploaded_docs TEXT[];
BEGIN
  -- Get all uploaded document types for the company
  SELECT ARRAY_AGG(cd.document_type) INTO _uploaded_docs
  FROM public.company_documents cd
  WHERE cd.company_id = _company_id;
  
  -- Check if all required documents are present
  RETURN QUERY
  SELECT
    (_required_docs <@ COALESCE(_uploaded_docs, ARRAY[]::TEXT[])) AS is_complete,
    ARRAY(SELECT UNNEST(_required_docs) EXCEPT SELECT UNNEST(COALESCE(_uploaded_docs, ARRAY[]::TEXT[]))) AS missing_documents,
    (_required_docs <@ COALESCE(_uploaded_docs, ARRAY[]::TEXT[])) AS has_required_documents,
    COALESCE(_uploaded_docs, ARRAY[]::TEXT[]) AS uploaded_documents;
END;
$$;

-- Function to get user access permissions based on verification status
CREATE OR REPLACE FUNCTION public.get_user_access_permissions(_user_id UUID)
RETURNS TABLE(
  can_access_dashboard BOOLEAN,
  can_submit_data BOOLEAN,
  can_submit_certificates BOOLEAN,
  can_view_company_data BOOLEAN,
  can_manage_company BOOLEAN,
  access_level TEXT,
  verification_status TEXT,
  company_id UUID,
  company_name TEXT,
  restriction_reason TEXT
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  _company_record RECORD;
  _user_roles public.app_role[];
BEGIN
  -- Get user's roles
  SELECT ARRAY_AGG(role) INTO _user_roles
  FROM public.user_roles
  WHERE user_id = _user_id;
  
  -- If user is an admin, grant full access
  IF 'super_admin' = ANY(_user_roles) OR 
     'internal_admin' = ANY(_user_roles) OR 
     'pengolah_data' = ANY(_user_roles) THEN
    RETURN QUERY
    SELECT 
      true as can_access_dashboard,
      true as can_submit_data,
      true as can_submit_certificates,
      true as can_view_company_data,
      true as can_manage_company,
      'admin' as access_level,
      'verified' as verification_status,
      NULL::UUID as company_id,
      NULL::TEXT as company_name,
      NULL::TEXT as restriction_reason;
  END IF;
  
  -- Get user's company information
  SELECT 
    c.id,
    c.company_name,
    c.status,
    up.is_company_admin
  INTO _company_record
  FROM public.companies c
  JOIN public.user_profiles up ON c.id = up.company_id
  WHERE up.user_id = _user_id
  LIMIT 1;
  
  -- If user doesn't have a company, return minimal access
  IF _company_record IS NULL THEN
    RETURN QUERY
    SELECT 
      false as can_access_dashboard,
      false as can_submit_data,
      false as can_submit_certificates,
      false as can_view_company_data,
      false as can_manage_company,
      'none' as access_level,
      'no_company' as verification_status,
      NULL::UUID as company_id,
      NULL::TEXT as company_name,
      'User does not belong to any company'::TEXT as restriction_reason;
  END IF;
  
  -- Return access permissions based on company verification status
  RETURN QUERY
  SELECT 
    CASE 
      WHEN _company_record.status IN ('verified', 'pending_verification', 'needs_correction') THEN true
      ELSE false
    END as can_access_dashboard,
    
    CASE 
      WHEN _company_record.status IN ('verified', 'needs_correction') THEN true
      ELSE false
    END as can_submit_data,
    
    CASE 
      WHEN _company_record.status = 'verified' THEN true
      ELSE false
    END as can_submit_certificates,
    
    CASE 
      WHEN _company_record.status IN ('verified', 'pending_verification', 'needs_correction') THEN true
      ELSE false
    END as can_view_company_data,
    
    CASE 
      WHEN _company_record.status IN ('verified', 'pending_verification', 'needs_correction') AND _company_record.is_company_admin THEN true
      ELSE false
    END as can_manage_company,
    
    CASE 
      WHEN _company_record.status = 'verified' THEN 'full'
      WHEN _company_record.status = 'pending_verification' THEN 'limited'
      WHEN _company_record.status = 'needs_correction' THEN 'limited'
      WHEN _company_record.status = 'rejected' THEN 'none'
      ELSE 'none'
    END as access_level,
    
    _company_record.status as verification_status,
    _company_record.id as company_id,
    _company_record.company_name as company_name,
    
    CASE 
      WHEN _company_record.status = 'pending_verification' THEN 'Company under review, limited access granted'
      WHEN _company_record.status = 'needs_correction' THEN 'Company needs correction, please update information'
      WHEN _company_record.status = 'rejected' THEN 'Company registration rejected'
      ELSE NULL
    END as restriction_reason;
END;
$$;

-- Update the has_role function to use the app_role enum properly
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.approve_company(UUID, UUID, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.reject_company(UUID, UUID, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.request_company_correction(UUID, UUID, JSONB) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.submit_company_corrections(UUID, UUID, JSONB) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.verify_certificate_document(UUID, UUID, TEXT, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.validate_company_documents(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_access_permissions(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, service_role;