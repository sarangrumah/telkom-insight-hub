-- Create ticket categories enum
CREATE TYPE ticket_category AS ENUM ('technical', 'billing', 'general', 'data_request', 'account', 'other');

-- Create ticket assignment status enum  
CREATE TYPE assignment_status AS ENUM ('unassigned', 'assigned', 'in_review', 'escalated');

-- Add new columns to tickets table
ALTER TABLE public.tickets 
ADD COLUMN category ticket_category DEFAULT 'general',
ADD COLUMN assigned_to uuid REFERENCES auth.users(id),
ADD COLUMN assignment_status assignment_status DEFAULT 'unassigned',
ADD COLUMN first_response_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN resolved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN escalated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN escalation_level INTEGER DEFAULT 0,
ADD COLUMN due_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN tags TEXT[],
ADD COLUMN internal_notes TEXT;

-- Create ticket_assignments table for tracking assignment history
CREATE TABLE public.ticket_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES auth.users(id),
  assigned_to UUID NOT NULL REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unassigned_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ticket_sla_metrics table for SLA tracking
CREATE TABLE public.ticket_sla_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  first_response_time_minutes INTEGER,
  resolution_time_minutes INTEGER,
  sla_target_response_minutes INTEGER DEFAULT 240, -- 4 hours default
  sla_target_resolution_minutes INTEGER DEFAULT 1440, -- 24 hours default
  response_sla_met BOOLEAN,
  resolution_sla_met BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.ticket_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_sla_metrics ENABLE ROW LEVEL SECURITY;

-- RLS policies for ticket_assignments
CREATE POLICY "Admins can view all ticket assignments" 
ON public.ticket_assignments 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'internal_admin') OR has_role(auth.uid(), 'pengolah_data'));

CREATE POLICY "Admins can manage ticket assignments" 
ON public.ticket_assignments 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'internal_admin') OR has_role(auth.uid(), 'pengolah_data'));

-- RLS policies for ticket_sla_metrics
CREATE POLICY "Admins can view all SLA metrics" 
ON public.ticket_sla_metrics 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'internal_admin') OR has_role(auth.uid(), 'pengolah_data'));

CREATE POLICY "Admins can manage SLA metrics" 
ON public.ticket_sla_metrics 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'internal_admin') OR has_role(auth.uid(), 'pengolah_data'));

-- Function to automatically calculate SLA metrics
CREATE OR REPLACE FUNCTION public.calculate_sla_metrics()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger to update SLA metrics when messages are added
CREATE TRIGGER update_sla_metrics_on_message
  AFTER INSERT ON public.ticket_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_sla_metrics();

-- Trigger to update SLA metrics when ticket status changes
CREATE TRIGGER update_sla_metrics_on_status_change
  AFTER UPDATE OF status ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_sla_metrics();

-- Function for automatic priority escalation
CREATE OR REPLACE FUNCTION public.escalate_overdue_tickets()
RETURNS void AS $$
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
$$ LANGUAGE plpgsql;

-- Add constraint to ensure ticket_sla_metrics has unique ticket_id
ALTER TABLE public.ticket_sla_metrics 
ADD CONSTRAINT unique_ticket_sla_metrics UNIQUE (ticket_id);