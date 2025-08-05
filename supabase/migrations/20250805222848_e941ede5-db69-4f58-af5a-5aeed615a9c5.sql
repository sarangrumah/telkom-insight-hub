-- Create API integration logs table
CREATE TABLE public.api_integration_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  api_name TEXT NOT NULL,
  request_data JSONB,
  response_data JSONB,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'pending')),
  response_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.api_integration_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own API logs" 
ON public.api_integration_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own API logs" 
ON public.api_integration_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all API logs" 
ON public.api_integration_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'internal_admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_api_integration_logs_user_id ON public.api_integration_logs(user_id);
CREATE INDEX idx_api_integration_logs_api_name ON public.api_integration_logs(api_name);
CREATE INDEX idx_api_integration_logs_status ON public.api_integration_logs(status);
CREATE INDEX idx_api_integration_logs_created_at ON public.api_integration_logs(created_at);

-- Add trigger for updated_at
CREATE TRIGGER update_api_integration_logs_updated_at
  BEFORE UPDATE ON public.api_integration_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add audit logging trigger
CREATE TRIGGER api_integration_logs_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.api_integration_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.log_changes();