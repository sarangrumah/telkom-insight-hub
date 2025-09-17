-- Add RLS policies to allow unauthenticated users to upload documents for registration
-- Policy for inserting documents - allow anyone to upload to temp/registration folder
CREATE POLICY "Allow public upload for registration documents" 
ON storage.objects 
FOR INSERT 
TO public
WITH CHECK (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = 'temp'
);

-- Policy for viewing documents - allow public read access to documents bucket
CREATE POLICY "Allow public read access to documents" 
ON storage.objects 
FOR SELECT 
TO public
USING (bucket_id = 'documents');

-- Policy for authenticated users to manage their own documents
CREATE POLICY "Users can manage their own documents" 
ON storage.objects 
FOR ALL 
TO authenticated
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);