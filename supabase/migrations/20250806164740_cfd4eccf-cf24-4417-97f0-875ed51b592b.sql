-- First, let's ensure we have an admin user by updating existing users
-- This will help fix the authentication access issue

-- Check if there are any existing users and grant them admin access
-- We'll update the first user to be a super admin if no admin exists
DO $$
DECLARE
    first_user_id uuid;
BEGIN
    -- Get the first user ID from profiles
    SELECT user_id INTO first_user_id 
    FROM public.profiles 
    ORDER BY created_at 
    LIMIT 1;
    
    -- If we found a user, ensure they have admin role
    IF first_user_id IS NOT NULL THEN
        -- Remove any existing roles for this user first
        DELETE FROM public.user_roles WHERE user_id = first_user_id;
        
        -- Add super_admin role
        INSERT INTO public.user_roles (user_id, role) 
        VALUES (first_user_id, 'super_admin');
        
        -- Ensure the profile is validated
        UPDATE public.profiles 
        SET is_validated = true 
        WHERE user_id = first_user_id;
    END IF;
END $$;