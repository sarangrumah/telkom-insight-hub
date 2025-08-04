-- Update documents bucket to only allow PDF files with 10MB limit
UPDATE storage.buckets 
SET 
  allowed_mime_types = ARRAY['application/pdf'],
  file_size_limit = 10485760
WHERE id = 'documents';