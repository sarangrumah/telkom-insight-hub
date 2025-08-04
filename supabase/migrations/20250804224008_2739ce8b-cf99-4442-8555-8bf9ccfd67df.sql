-- Add file_url column to telekom_data table
ALTER TABLE public.telekom_data 
ADD COLUMN file_url TEXT;

-- Create storage policies for telekom data files
CREATE POLICY "Users can upload their own telekom files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND (storage.foldername(name))[2] = 'telekom-data'
);

CREATE POLICY "Users can view their own telekom files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND (storage.foldername(name))[2] = 'telekom-data'
);

CREATE POLICY "Admins can view all telekom files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[2] = 'telekom-data'
  AND (
    has_role(auth.uid(), 'super_admin'::app_role) OR 
    has_role(auth.uid(), 'internal_admin'::app_role) OR 
    has_role(auth.uid(), 'pengolah_data'::app_role)
  )
);

CREATE POLICY "Users can delete their own telekom files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND (storage.foldername(name))[2] = 'telekom-data'
);