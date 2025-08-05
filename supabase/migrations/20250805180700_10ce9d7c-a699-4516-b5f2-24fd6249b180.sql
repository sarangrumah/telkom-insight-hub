-- Phase 1: Security Hardening - Fix function search path security
-- Update existing functions to have proper search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email));
  
  -- Set default role based on signup context
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'guest');
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_sla_metrics()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  ticket_created_at TIMESTAMP WITH TIME ZONE;
  first_admin_response TIMESTAMP WITH TIME ZONE;
  ticket_resolved_at TIMESTAMP WITH TIME ZONE;
  response_time_minutes INTEGER;
  resolution_time_minutes INTEGER;
  sla_response_target INTEGER := 240; -- 4 hours
  sla_resolution_target INTEGER := 1440; -- 24 hours
BEGIN
  -- Get ticket creation time
  SELECT created_at INTO ticket_created_at 
  FROM public.tickets 
  WHERE id = NEW.ticket_id;
  
  -- Get first admin response time
  SELECT MIN(created_at) INTO first_admin_response
  FROM public.ticket_messages 
  WHERE ticket_id = NEW.ticket_id AND is_admin_message = true;
  
  -- Get resolution time if ticket is resolved
  SELECT resolved_at INTO ticket_resolved_at
  FROM public.tickets 
  WHERE id = NEW.ticket_id AND status IN ('resolved', 'closed');
  
  -- Calculate response time in minutes
  IF first_admin_response IS NOT NULL THEN
    response_time_minutes := EXTRACT(EPOCH FROM (first_admin_response - ticket_created_at)) / 60;
  END IF;
  
  -- Calculate resolution time in minutes
  IF ticket_resolved_at IS NOT NULL THEN
    resolution_time_minutes := EXTRACT(EPOCH FROM (ticket_resolved_at - ticket_created_at)) / 60;
  END IF;
  
  -- Adjust SLA targets based on priority
  SELECT CASE 
    WHEN priority = 'high' THEN 120    -- 2 hours for high priority
    WHEN priority = 'medium' THEN 240  -- 4 hours for medium priority
    WHEN priority = 'low' THEN 480     -- 8 hours for low priority
    ELSE 240
  END INTO sla_response_target
  FROM public.tickets WHERE id = NEW.ticket_id;
  
  SELECT CASE 
    WHEN priority = 'high' THEN 720    -- 12 hours for high priority
    WHEN priority = 'medium' THEN 1440 -- 24 hours for medium priority
    WHEN priority = 'low' THEN 2880    -- 48 hours for low priority
    ELSE 1440
  END INTO sla_resolution_target
  FROM public.tickets WHERE id = NEW.ticket_id;
  
  -- Insert or update SLA metrics
  INSERT INTO public.ticket_sla_metrics (
    ticket_id,
    first_response_time_minutes,
    resolution_time_minutes,
    sla_target_response_minutes,
    sla_target_resolution_minutes,
    response_sla_met,
    resolution_sla_met
  ) VALUES (
    NEW.ticket_id,
    response_time_minutes,
    resolution_time_minutes,
    sla_response_target,
    sla_resolution_target,
    CASE WHEN response_time_minutes IS NULL THEN NULL 
         ELSE response_time_minutes <= sla_response_target END,
    CASE WHEN resolution_time_minutes IS NULL THEN NULL 
         ELSE resolution_time_minutes <= sla_resolution_target END
  )
  ON CONFLICT (ticket_id) DO UPDATE SET
    first_response_time_minutes = EXCLUDED.first_response_time_minutes,
    resolution_time_minutes = EXCLUDED.resolution_time_minutes,
    sla_target_response_minutes = EXCLUDED.sla_target_response_minutes,
    sla_target_resolution_minutes = EXCLUDED.sla_target_resolution_minutes,
    response_sla_met = EXCLUDED.response_sla_met,
    resolution_sla_met = EXCLUDED.resolution_sla_met,
    updated_at = now();
    
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.escalate_overdue_tickets()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Escalate tickets that haven't received first response within SLA
  UPDATE public.tickets 
  SET 
    priority = CASE 
      WHEN priority = 'low' THEN 'medium'
      WHEN priority = 'medium' THEN 'high'
      ELSE priority
    END,
    escalation_level = escalation_level + 1,
    escalated_at = now()
  WHERE 
    status NOT IN ('resolved', 'closed')
    AND created_at < now() - INTERVAL '4 hours'
    AND NOT EXISTS (
      SELECT 1 FROM public.ticket_messages 
      WHERE ticket_id = tickets.id AND is_admin_message = true
    );
    
  -- Escalate high priority tickets that are still open after 8 hours
  UPDATE public.tickets 
  SET 
    escalation_level = escalation_level + 1,
    escalated_at = now()
  WHERE 
    priority = 'high'
    AND status NOT IN ('resolved', 'closed')
    AND created_at < now() - INTERVAL '8 hours'
    AND escalation_level = 0;
END;
$function$;

-- Create audit log table for security monitoring
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for audit logs - only admins can view
CREATE POLICY "Admins can view audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'internal_admin'::app_role));

-- Create function to log changes
CREATE OR REPLACE FUNCTION public.log_changes()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_values)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- Add audit triggers to critical tables
CREATE TRIGGER audit_telekom_data_changes
AFTER INSERT OR UPDATE OR DELETE ON public.telekom_data
FOR EACH ROW EXECUTE FUNCTION public.log_changes();

CREATE TRIGGER audit_user_roles_changes
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.log_changes();

CREATE TRIGGER audit_tickets_changes
AFTER INSERT OR UPDATE OR DELETE ON public.tickets
FOR EACH ROW EXECUTE FUNCTION public.log_changes();