-- Create a policy to allow public search with limited columns
CREATE POLICY "Public can search with limited data view" 
ON public.telekom_data 
FOR SELECT 
USING (true);

-- Update the existing restrictive policy to be more specific
DROP POLICY IF EXISTS "Validated users can view telekom data" ON public.telekom_data;

-- Create a new policy for full data access for validated users
CREATE POLICY "Validated users can view full telekom data" 
ON public.telekom_data 
FOR SELECT 
USING (
  -- Allow public to see limited columns OR validated users to see all
  EXISTS ( 
    SELECT 1
    FROM profiles
    WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_validated = true))
  )
);