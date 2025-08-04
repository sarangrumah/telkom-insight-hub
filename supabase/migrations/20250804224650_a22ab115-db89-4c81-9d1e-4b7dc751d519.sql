-- Update documents bucket to only allow PDF files with 10MB limit
UPDATE storage.buckets 
SET 
  allowed_mime_types = ARRAY['application/pdf'],
  file_size_limit = 10485760
WHERE id = 'documents';

-- Create policy to validate PDF files server-side
CREATE POLICY "Validate PDF files only" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'documents' AND 
  (storage.extension(name) = 'pdf' OR storage.extension(name) = 'PDF') AND
  octet_length(decode(encode(metadata->'mimetype'::text, 'escape'), 'escape')) <= 15 AND
  metadata->>'mimetype' = 'application/pdf'
);