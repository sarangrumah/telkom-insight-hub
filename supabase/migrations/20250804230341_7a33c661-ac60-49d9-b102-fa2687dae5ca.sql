-- Update the documents bucket to be public to allow direct URL access
UPDATE storage.buckets 
SET public = true 
WHERE id = 'documents';

-- Create RLS policies for the documents bucket to ensure proper access control
CREATE POLICY "Users can view documents they have access to" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'documents' AND 
  (
    -- Allow access if user has admin roles
    (auth.uid() IS NOT NULL AND (
      EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'internal_admin', 'pengolah_data'))
    )) OR
    -- Allow access if user is validated and can see telekom data
    (auth.uid() IS NOT NULL AND 
     EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_validated = true))
  )
);

CREATE POLICY "Users can upload documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'documents' AND 
  auth.uid() IS NOT NULL AND
  (
    -- Allow upload if user has admin roles or pelaku_usaha role
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'internal_admin', 'pengolah_data', 'pelaku_usaha'))
  )
);

CREATE POLICY "Users can update their own documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'documents' AND 
  auth.uid() IS NOT NULL AND
  (
    -- Allow update if user has admin roles
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'internal_admin', 'pengolah_data')) OR
    -- Allow update if user owns the document (check owner field if it exists)
    owner = auth.uid()
  )
);

CREATE POLICY "Users can delete documents they own or admins can delete any" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'documents' AND 
  auth.uid() IS NOT NULL AND
  (
    -- Allow delete if user has admin roles
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'internal_admin', 'pengolah_data')) OR
    -- Allow delete if user owns the document
    owner = auth.uid()
  )
);