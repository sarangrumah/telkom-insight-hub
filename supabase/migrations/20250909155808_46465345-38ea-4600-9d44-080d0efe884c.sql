-- Update the handle_new_user function to assign pelaku_usaha role instead of guest
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email));
  
  -- Set default role to pelaku_usaha for registered users (not guest)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'pelaku_usaha');
  
  RETURN NEW;
END;
$function$;

-- Update existing user with guest role to pelaku_usaha
UPDATE public.user_roles 
SET role = 'pelaku_usaha'
WHERE role = 'guest' 
  AND user_id IN (
    SELECT id FROM auth.users 
    WHERE email = 'dev.ademaryadi@gmail.com'
  );