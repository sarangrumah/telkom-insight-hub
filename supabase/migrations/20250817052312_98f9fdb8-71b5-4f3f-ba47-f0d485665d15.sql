-- Phase 3: Create Default Permissions for Existing Roles

-- Create default permissions for super_admin (full access)
INSERT INTO public.permissions (role, module_id, can_create, can_read, can_update, can_delete)
SELECT 
  'super_admin'::app_role,
  m.id,
  true,
  true,
  true,
  true
FROM public.modules m
ON CONFLICT (role, module_id, field_id) DO UPDATE SET
  can_create = EXCLUDED.can_create,
  can_read = EXCLUDED.can_read,
  can_update = EXCLUDED.can_update,
  can_delete = EXCLUDED.can_delete;

-- Create default permissions for internal_admin
INSERT INTO public.permissions (role, module_id, can_create, can_read, can_update, can_delete)
SELECT 
  'internal_admin'::app_role,
  m.id,
  CASE 
    WHEN m.code IN ('data_management', 'faq', 'support', 'admin_faq', 'admin_tickets') THEN true
    ELSE false
  END,
  true,
  CASE 
    WHEN m.code IN ('data_management', 'faq', 'support', 'admin_faq', 'admin_tickets') THEN true
    ELSE false
  END,
  CASE 
    WHEN m.code IN ('data_management', 'faq', 'support', 'admin_faq', 'admin_tickets') THEN true
    ELSE false
  END
FROM public.modules m
ON CONFLICT (role, module_id, field_id) DO UPDATE SET
  can_create = EXCLUDED.can_create,
  can_read = EXCLUDED.can_read,
  can_update = EXCLUDED.can_update,
  can_delete = EXCLUDED.can_delete;

-- Create default permissions for pengolah_data
INSERT INTO public.permissions (role, module_id, can_create, can_read, can_update, can_delete)
SELECT 
  'pengolah_data'::app_role,
  m.id,
  CASE 
    WHEN m.code IN ('data_management', 'support') THEN true
    ELSE false
  END,
  CASE 
    WHEN m.code IN ('dashboard', 'data_management', 'data_visualization', 'faq', 'support') THEN true
    ELSE false
  END,
  CASE 
    WHEN m.code IN ('data_management', 'support') THEN true
    ELSE false
  END,
  CASE 
    WHEN m.code IN ('data_management', 'support') THEN true
    ELSE false
  END
FROM public.modules m
ON CONFLICT (role, module_id, field_id) DO UPDATE SET
  can_create = EXCLUDED.can_create,
  can_read = EXCLUDED.can_read,
  can_update = EXCLUDED.can_update,
  can_delete = EXCLUDED.can_delete;

-- Create default permissions for pelaku_usaha (limited to their own data)
INSERT INTO public.permissions (role, module_id, can_create, can_read, can_update, can_delete, conditions)
SELECT 
  'pelaku_usaha'::app_role,
  m.id,
  CASE 
    WHEN m.code IN ('data_management', 'support') THEN true
    ELSE false
  END,
  CASE 
    WHEN m.code IN ('dashboard', 'data_management', 'data_visualization', 'faq', 'support') THEN true
    ELSE false
  END,
  CASE 
    WHEN m.code IN ('data_management', 'support') THEN true
    ELSE false
  END,
  false, -- Can't delete others' data
  CASE 
    WHEN m.code = 'data_management' THEN '{"own_records_only": true}'::jsonb
    WHEN m.code = 'support' THEN '{"own_tickets_only": true}'::jsonb
    ELSE '{}'::jsonb
  END
FROM public.modules m
ON CONFLICT (role, module_id, field_id) DO UPDATE SET
  can_create = EXCLUDED.can_create,
  can_read = EXCLUDED.can_read,
  can_update = EXCLUDED.can_update,
  can_delete = EXCLUDED.can_delete,
  conditions = EXCLUDED.conditions;

-- Create default permissions for internal_group
INSERT INTO public.permissions (role, module_id, can_create, can_read, can_update, can_delete)
SELECT 
  'internal_group'::app_role,
  m.id,
  false,
  CASE 
    WHEN m.code IN ('dashboard', 'data_visualization', 'faq') THEN true
    ELSE false
  END,
  false,
  false
FROM public.modules m
ON CONFLICT (role, module_id, field_id) DO UPDATE SET
  can_create = EXCLUDED.can_create,
  can_read = EXCLUDED.can_read,
  can_update = EXCLUDED.can_update,
  can_delete = EXCLUDED.can_delete;

-- Create default permissions for guest (very limited)
INSERT INTO public.permissions (role, module_id, can_create, can_read, can_update, can_delete)
SELECT 
  'guest'::app_role,
  m.id,
  false,
  CASE 
    WHEN m.code IN ('faq') THEN true
    ELSE false
  END,
  false,
  false
FROM public.modules m
ON CONFLICT (role, module_id, field_id) DO UPDATE SET
  can_create = EXCLUDED.can_create,
  can_read = EXCLUDED.can_read,
  can_update = EXCLUDED.can_update,
  can_delete = EXCLUDED.can_delete;