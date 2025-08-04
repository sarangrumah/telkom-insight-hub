-- Create ticket_messages table for conversation between admin and visitors
CREATE TABLE public.ticket_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  is_admin_message BOOLEAN NOT NULL DEFAULT false,
  file_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for ticket messages
CREATE POLICY "Users can view messages for their own tickets" 
ON public.ticket_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.tickets 
    WHERE tickets.id = ticket_messages.ticket_id 
    AND tickets.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create messages for their own tickets" 
ON public.ticket_messages 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tickets 
    WHERE tickets.id = ticket_messages.ticket_id 
    AND tickets.user_id = auth.uid()
  ) AND user_id = auth.uid()
);

CREATE POLICY "Admins can view all ticket messages" 
ON public.ticket_messages 
FOR SELECT 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'internal_admin'::app_role) OR 
  has_role(auth.uid(), 'pengolah_data'::app_role)
);

CREATE POLICY "Admins can create messages on any ticket" 
ON public.ticket_messages 
FOR INSERT 
WITH CHECK (
  (has_role(auth.uid(), 'super_admin'::app_role) OR 
   has_role(auth.uid(), 'internal_admin'::app_role) OR 
   has_role(auth.uid(), 'pengolah_data'::app_role)) AND 
  user_id = auth.uid()
);

CREATE POLICY "Admins can update ticket messages" 
ON public.ticket_messages 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'internal_admin'::app_role) OR 
  has_role(auth.uid(), 'pengolah_data'::app_role)
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ticket_messages_updated_at
BEFORE UPDATE ON public.ticket_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_ticket_messages_ticket_id ON public.ticket_messages(ticket_id);
CREATE INDEX idx_ticket_messages_created_at ON public.ticket_messages(created_at DESC);