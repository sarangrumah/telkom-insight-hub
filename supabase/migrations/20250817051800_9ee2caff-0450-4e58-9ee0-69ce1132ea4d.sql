-- Phase 1: Create Core Permission Tables

-- System modules definition
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_module_id UUID REFERENCES public.modules(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Fields within modules
CREATE TABLE IF NOT EXISTS public.fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  field_type TEXT NOT NULL DEFAULT 'text', -- text, number, date, select, file, etc.
  is_system_field BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(module_id, code)
);

-- Role-based permissions with CRUD and field-level access
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role app_role NOT NULL,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  field_id UUID REFERENCES public.fields(id) ON DELETE CASCADE,
  
  -- CRUD permissions
  can_create BOOLEAN NOT NULL DEFAULT false,
  can_read BOOLEAN NOT NULL DEFAULT false,
  can_update BOOLEAN NOT NULL DEFAULT false,
  can_delete BOOLEAN NOT NULL DEFAULT false,
  
  -- Field-level permissions
  field_access TEXT DEFAULT 'read_only', -- hidden, read_only, editable, required
  
  -- Conditional permissions (JSON rules)
  conditions JSONB DEFAULT '{}',
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure unique permission per role-module-field combination
  UNIQUE(role, module_id, field_id)
);

-- Record-level permissions for granular access control
CREATE TABLE IF NOT EXISTS public.record_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  user_id UUID NOT NULL,
  permission_type TEXT NOT NULL, -- create, read, update, delete
  granted_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(table_name, record_id, user_id, permission_type)
);

-- Permission templates for quick role setup
CREATE TABLE IF NOT EXISTS public.permission_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  target_role app_role NOT NULL,
  permissions_config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all permission tables
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.record_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for permission tables
CREATE POLICY "Admins can manage modules" ON public.modules
FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'internal_admin'::app_role));

CREATE POLICY "Everyone can view active modules" ON public.modules
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage fields" ON public.fields
FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'internal_admin'::app_role));

CREATE POLICY "Everyone can view active fields" ON public.fields
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage permissions" ON public.permissions
FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'internal_admin'::app_role));

CREATE POLICY "Users can view permissions for their role" ON public.permissions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND user_roles.role = permissions.role
  )
);

CREATE POLICY "Admins can manage record permissions" ON public.record_permissions
FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'internal_admin'::app_role));

CREATE POLICY "Users can view their own record permissions" ON public.record_permissions
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage permission templates" ON public.permission_templates
FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'internal_admin'::app_role));

CREATE POLICY "Everyone can view active permission templates" ON public.permission_templates
FOR SELECT USING (is_active = true);

-- Create triggers for updated_at columns
CREATE TRIGGER update_modules_updated_at
  BEFORE UPDATE ON public.modules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fields_updated_at
  BEFORE UPDATE ON public.fields
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_permissions_updated_at
  BEFORE UPDATE ON public.permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_permission_templates_updated_at
  BEFORE UPDATE ON public.permission_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();