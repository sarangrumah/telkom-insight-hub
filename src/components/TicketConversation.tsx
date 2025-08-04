import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FileUpload } from '@/components/FileUpload';
import { ChevronDown, ChevronUp, MessageCircle, Send, Clock, User, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface TicketMessage {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_admin_message: boolean;
  file_url?: string;
  is_read: boolean;
  created_at: string;
}

interface TicketConversationProps {
  ticketId: string;
  isAdmin?: boolean;
}

export function TicketConversation({ ticketId, isAdmin = false }: TicketConversationProps) {
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [fileUrl, setFileUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
    markMessagesAsRead();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('ticket-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_messages',
          filter: `ticket_id=eq.${ticketId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as TicketMessage]);
          if (!historyOpen && payload.new.is_admin_message !== isAdmin) {
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId, isAdmin, historyOpen]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages(data || []);
    
    // Count unread messages
    const unread = data?.filter(msg => 
      !msg.is_read && msg.is_admin_message !== isAdmin
    ).length || 0;
    setUnreadCount(unread);
  };

  const markMessagesAsRead = async () => {
    if (!isAdmin) return;
    
    await supabase
      .from('ticket_messages')
      .update({ is_read: true })
      .eq('ticket_id', ticketId)
      .eq('is_admin_message', false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    
    const { error } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: ticketId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        message: newMessage,
        is_admin_message: isAdmin,
        file_url: fileUrl || null
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      console.error('Error sending message:', error);
    } else {
      setNewMessage('');
      setFileUrl('');
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully",
      });
    }
    
    setLoading(false);
  };

  const latestMessage = messages[messages.length - 1];

  return (
    <div className="space-y-4">
      {/* Latest Message Preview */}
      {latestMessage && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Latest Message</CardTitle>
              <div className="flex items-center gap-2">
                {latestMessage.is_admin_message ? (
                  <Badge variant="secondary" className="text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    <User className="w-3 h-3 mr-1" />
                    User
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {format(new Date(latestMessage.created_at), 'MMM dd, HH:mm')}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-foreground">{latestMessage.message}</p>
            {latestMessage.file_url && (
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto mt-2"
                onClick={() => window.open(latestMessage.file_url, '_blank')}
              >
                View Attachment
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Reply Form */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <Textarea
              placeholder="Type your reply..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="min-h-[80px]"
            />
            
            <FileUpload
              value={fileUrl}
              onChange={(url) => setFileUrl(url || '')}
            />
            
            <Button 
              onClick={sendMessage} 
              disabled={loading || !newMessage.trim()}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Reply
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History Section */}
      {messages.length > 0 && (
        <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full">
              <MessageCircle className="w-4 h-4 mr-2" />
              History ({messages.length} messages)
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  {unreadCount}
                </Badge>
              )}
              {historyOpen ? (
                <ChevronUp className="w-4 h-4 ml-auto" />
              ) : (
                <ChevronDown className="w-4 h-4 ml-auto" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-2 mt-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg ${
                  message.is_admin_message
                    ? 'bg-primary/10 border-l-4 border-primary ml-8'
                    : 'bg-muted mr-8'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {message.is_admin_message ? (
                      <Badge variant="secondary" className="text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        <User className="w-3 h-3 mr-1" />
                        User
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(message.created_at), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
                
                <p className="text-sm text-foreground">{message.message}</p>
                
                {message.file_url && (
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto mt-2"
                    onClick={() => window.open(message.file_url, '_blank')}
                  >
                    View Attachment
                  </Button>
                )}
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}