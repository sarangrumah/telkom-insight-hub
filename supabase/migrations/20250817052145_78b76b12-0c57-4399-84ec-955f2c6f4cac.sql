-- Phase 2: Create Permission Functions and Seed Data

-- Function to check user permission for a specific action
CREATE OR REPLACE FUNCTION public.check_user_permission(
  _user_id UUID,
  _module_code TEXT,
  _action TEXT, -- create, read, update, delete
  _field_code TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_roles app_role[];
  _has_permission BOOLEAN := false;
  _permission_record permissions%ROWTYPE;
BEGIN
  -- Get all roles for the user
  SELECT ARRAY_AGG(role) INTO _user_roles
  FROM public.user_roles
  WHERE user_id = _user_id;
  
  -- If no roles, return false
  IF _user_roles IS NULL OR array_length(_user_roles, 1) = 0 THEN
    RETURN false;
  END IF;
  
  -- Check for module-level permission
  FOR _permission_record IN
    SELECT p.*
    FROM public.permissions p
    JOIN public.modules m ON p.module_id = m.id
    WHERE m.code = _module_code
      AND p.role = ANY(_user_roles)
      AND (_field_code IS NULL OR p.field_id IS NULL)
  LOOP
    CASE _action
      WHEN 'create' THEN _has_permission := _permission_record.can_create;
      WHEN 'read' THEN _has_permission := _permission_record.can_read;
      WHEN 'update' THEN _has_permission := _permission_record.can_update;
      WHEN 'delete' THEN _has_permission := _permission_record.can_delete;
      ELSE _has_permission := false;
    END CASE;
    
    -- If permission found, return true
    IF _has_permission THEN
      RETURN true;
    END IF;
  END LOOP;
  
  -- Check field-level permission if field_code provided
  IF _field_code IS NOT NULL THEN
    FOR _permission_record IN
      SELECT p.*
      FROM public.permissions p
      JOIN public.modules m ON p.module_id = m.id
      JOIN public.fields f ON p.field_id = f.id
      WHERE m.code = _module_code
        AND f.code = _field_code
        AND p.role = ANY(_user_roles)
    LOOP
      CASE _action
        WHEN 'create' THEN _has_permission := _permission_record.can_create;
        WHEN 'read' THEN _has_permission := _permission_record.can_read;
        WHEN 'update' THEN _has_permission := _permission_record.can_update;
        WHEN 'delete' THEN _has_permission := _permission_record.can_delete;
        ELSE _has_permission := false;
      END CASE;
      
      IF _has_permission THEN
        RETURN true;
      END IF;
    END LOOP;
  END IF;
  
  RETURN false;
END;
$$;

-- Function to check record-level permission
CREATE OR REPLACE FUNCTION public.check_record_permission(
  _user_id UUID,
  _table_name TEXT,
  _record_id UUID,
  _action TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.record_permissions
    WHERE user_id = _user_id
      AND table_name = _table_name
      AND record_id = _record_id
      AND permission_type = _action
      AND (expires_at IS NULL OR expires_at > now())
  );
END;
$$;

-- Function to get user permissions for a module
CREATE OR REPLACE FUNCTION public.get_user_permissions(
  _user_id UUID,
  _module_code TEXT DEFAULT NULL
)
RETURNS TABLE (
  module_code TEXT,
  module_name TEXT,
  field_code TEXT,
  field_name TEXT,
  can_create BOOLEAN,
  can_read BOOLEAN,
  can_update BOOLEAN,
  can_delete BOOLEAN,
  field_access TEXT
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_roles app_role[];
BEGIN
  -- Get all roles for the user
  SELECT ARRAY_AGG(role) INTO _user_roles
  FROM public.user_roles
  WHERE user_id = _user_id;
  
  -- Return permissions for user's roles
  RETURN QUERY
  SELECT 
    m.code as module_code,
    m.name as module_name,
    COALESCE(f.code, '') as field_code,
    COALESCE(f.name, '') as field_name,
    p.can_create,
    p.can_read,
    p.can_update,
    p.can_delete,
    p.field_access
  FROM public.permissions p
  JOIN public.modules m ON p.module_id = m.id
  LEFT JOIN public.fields f ON p.field_id = f.id
  WHERE p.role = ANY(_user_roles)
    AND (_module_code IS NULL OR m.code = _module_code)
    AND m.is_active = true
    AND (f.id IS NULL OR f.is_active = true)
  ORDER BY m.code, f.code;
END;
$$;

-- Seed initial modules
INSERT INTO public.modules (name, code, description) VALUES
('Dashboard', 'dashboard', 'Main dashboard and analytics'),
('Data Management', 'data_management', 'Telecommunications data management'),
('Data Visualization', 'data_visualization', 'Data charts and visualization'),
('FAQ Management', 'faq', 'FAQ content management'),
('Support/Tickets', 'support', 'Support ticket system'),
('User Management', 'user_management', 'User and role management'),
('Admin FAQ', 'admin_faq', 'Administrative FAQ management'),
('Admin Tickets', 'admin_tickets', 'Administrative ticket management')
ON CONFLICT (code) DO NOTHING;

-- Seed fields for Data Management module
INSERT INTO public.fields (module_id, name, code, field_type, is_system_field)
SELECT 
  m.id,
  field_name,
  field_code,
  field_type,
  is_system
FROM public.modules m
CROSS JOIN (VALUES
  ('Company Name', 'company_name', 'text', true),
  ('Service Type', 'service_type', 'select', true),
  ('Sub Service Type', 'sub_service_type', 'text', false),
  ('License Number', 'license_number', 'text', false),
  ('Province', 'province_id', 'select', false),
  ('Kabupaten/Kota', 'kabupaten_id', 'select', false),
  ('Status', 'status', 'select', false),
  ('License Date', 'license_date', 'date', false),
  ('Region', 'region', 'text', false),
  ('Latitude', 'latitude', 'number', false),
  ('Longitude', 'longitude', 'number', false),
  ('File Document', 'file_url', 'file', false),
  ('Data Source', 'data_source', 'text', true),
  ('Created By', 'created_by', 'text', true),
  ('Created At', 'created_at', 'date', true),
  ('Updated At', 'updated_at', 'date', true)
) AS fields(field_name, field_code, field_type, is_system)
WHERE m.code = 'data_management'
ON CONFLICT (module_id, code) DO NOTHING;