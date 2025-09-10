-- Create correction functions for companies
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
  IF NOT (has_role(_requested_by, 'super_admin'::app_role) OR has_role(_requested_by, 'internal_admin'::app_role)) THEN
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
END;
$$;

-- Create function to submit corrections
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

  -- Update company status back to pending verification
  UPDATE public.companies
  SET 
    status = 'pending_verification',
    correction_status = 'corrected',
    updated_at = now()
  WHERE id = _company_id AND status = 'needs_correction';
END;
$$;

-- Add RLS policies for correction functions
CREATE POLICY "Admins can request corrections" ON public.companies
  FOR UPDATE USING (
    (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'internal_admin'::app_role))
    AND status IN ('pending_verification', 'needs_correction')
  );

CREATE POLICY "Company members can submit corrections" ON public.companies  
  FOR UPDATE USING (
    id IN (
      SELECT company_id FROM public.user_profiles 
      WHERE user_id = auth.uid()
    ) AND status = 'needs_correction'
  );