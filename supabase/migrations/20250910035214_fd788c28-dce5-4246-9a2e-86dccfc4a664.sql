-- Add RLS policy to allow public read access to indonesian_regions table
CREATE POLICY "Anyone can view indonesian regions" 
ON public.indonesian_regions 
FOR SELECT 
USING (true);