-- Fix the RLS policy to be more secure
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Public can search with limited data view" ON public.telekom_data;

-- Create a more secure policy that allows limited public access
CREATE POLICY "Public limited search access" 
ON public.telekom_data 
FOR SELECT 
USING (
  -- If user is authenticated and validated, show all data
  CASE 
    WHEN auth.uid() IS NOT NULL THEN 
      EXISTS ( 
        SELECT 1
        FROM profiles
        WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_validated = true))
      )
    -- If user is not authenticated, allow access but app will filter columns
    ELSE true
  END
);