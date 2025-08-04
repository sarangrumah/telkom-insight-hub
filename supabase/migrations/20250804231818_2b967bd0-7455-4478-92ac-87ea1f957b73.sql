-- Add file_url column to tickets table to support PDF uploads
ALTER TABLE public.tickets 
ADD COLUMN file_url TEXT;