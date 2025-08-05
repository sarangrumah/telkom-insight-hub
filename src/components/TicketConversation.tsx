import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FileUpload } from '@/components/FileUpload';
import { ChevronDown, ChevronUp, MessageCircle, Send, Clock, User, Shield, CheckCircle2, MoreHorizontal } from 'lucide-react';
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
  const [optimisticMessage, setOptimisticMessage] = useState<TicketMessage | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
    markMessagesAsRead();
  }, [ticketId, isAdmin]);

  // Separate effect for real-time subscription
  useEffect(() => {
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
          const newMessage = payload.new as TicketMessage;
          setMessages(prev => [...prev, newMessage]);
          
          // Clear optimistic message if it matches the new message
          setOptimisticMessage(prevOptimistic => {
            if (prevOptimistic && 
                newMessage.message === prevOptimistic.message && 
                newMessage.is_admin_message === prevOptimistic.is_admin_message) {
              return null;
            }
            return prevOptimistic;
          });
          
          if (!historyOpen && newMessage.is_admin_message !== isAdmin) {
            setUnreadCount(prev => prev + 1);
          }

          // Trigger parent refresh for ticket list
          window.dispatchEvent(new CustomEvent('refreshTickets'));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId, isAdmin, historyOpen]);

  // Auto-clear optimistic message after timeout
  useEffect(() => {
    if (optimisticMessage) {
      const timeout = setTimeout(() => {
        setOptimisticMessage(null);
      }, 10000); // Clear after 10 seconds

      return () => clearTimeout(timeout);
    }
  }, [optimisticMessage]);

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
    // For visitors: mark admin messages as read
    // For admins: mark user messages as read
    await supabase
      .from('ticket_messages')
      .update({ is_read: true })
      .eq('ticket_id', ticketId)
      .eq('is_admin_message', isAdmin ? false : true);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    
    // Create optimistic message for immediate feedback
    const tempMessage: TicketMessage = {
      id: 'temp-' + Date.now(),
      ticket_id: ticketId,
      user_id: '',
      message: newMessage,
      is_admin_message: isAdmin,
      file_url: fileUrl || undefined,
      is_read: false,
      created_at: new Date().toISOString()
    };
    
    // Show optimistic message immediately
    setOptimisticMessage(tempMessage);
    const currentMessage = newMessage;
    const currentFile = fileUrl;
    setNewMessage('');
    setFileUrl('');
    
    const { error } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: ticketId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        message: currentMessage,
        is_admin_message: isAdmin,
        file_url: currentFile || null
      });

    if (error) {
      // Restore message on error and clear optimistic
      setNewMessage(currentMessage);
      setFileUrl(currentFile);
      setOptimisticMessage(null);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      console.error('Error sending message:', error);
    } else {
      toast({
        title: "Message sent",
        description: isAdmin ? "Your admin response has been sent" : "Your message has been sent successfully",
      });
    }
    
    setLoading(false);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && historyOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, optimisticMessage, historyOpen]);

  // Handle typing simulation
  useEffect(() => {
    if (newMessage) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
    }
  }, [newMessage]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [newMessage]);

  // Handle Enter key for sending
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Combine actual messages with optimistic message, then get latest
  const displayMessages = optimisticMessage ? [...messages, optimisticMessage] : messages;
  const latestMessage = displayMessages[displayMessages.length - 1];

  // Force re-calculation of latest message when messages or optimistic message changes
  useEffect(() => {
    // This effect ensures the component re-renders when message state changes
  }, [messages, optimisticMessage]);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Latest Message Preview */}
      {latestMessage && (
        <Card className="hover-scale transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary" />
                Latest Message
              </CardTitle>
              <div className="flex items-center gap-2">
                 {latestMessage.is_admin_message ? (
                   <Badge variant="default" className="text-xs bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0">
                     <Shield className="w-3 h-3 mr-1" />
                     Admin Response
                   </Badge>
                 ) : (
                   <Badge variant="outline" className="text-xs border-primary/20">
                     <User className="w-3 h-3 mr-1" />
                     User
                   </Badge>
                 )}
                 {optimisticMessage && latestMessage.id.startsWith('temp-') && (
                   <Badge variant="secondary" className="text-xs animate-pulse">
                     <MoreHorizontal className="w-3 h-3 mr-1" />
                     Sending...
                   </Badge>
                 )}
                <span className="text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {format(new Date(latestMessage.created_at), 'MMM dd, HH:mm')}
                </span>
              </div>
            </div>
          </CardHeader>
           <CardContent className={`pt-0 transition-all duration-300 ${latestMessage.is_admin_message ? 'bg-gradient-to-r from-primary/5 to-transparent rounded-lg border-l-4 border-primary' : ''}`}>
             <p className={`text-sm leading-relaxed ${latestMessage.is_admin_message ? 'font-medium text-foreground' : 'text-foreground'}`}>
               {latestMessage.message}
             </p>
             {latestMessage.file_url && (
               <Button
                 variant="link"
                 size="sm"
                 className="p-0 h-auto mt-2 text-primary hover:text-primary/80 transition-colors"
                 onClick={() => window.open(latestMessage.file_url, '_blank')}
               >
                 📎 View Attachment
               </Button>
             )}
           </CardContent>
        </Card>
      )}

      {/* Quick Reply Form */}
      <Card className="hover-scale transition-all duration-300 hover:shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Send className="w-4 h-4 text-primary" />
            {isAdmin ? 'Admin Response' : 'Quick Reply'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                placeholder="Type your reply... (Press Enter to send, Shift+Enter for new line)"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="min-h-[80px] max-h-[200px] resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                disabled={loading}
              />
              {isTyping && (
                <div className="absolute bottom-2 right-2 text-xs text-muted-foreground animate-pulse">
                  Typing...
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <FileUpload
                value={fileUrl}
                onChange={(url) => setFileUrl(url || '')}
              />
              
              <div className="flex gap-2">
                <Button 
                  onClick={sendMessage} 
                  disabled={loading || !newMessage.trim()}
                  className="flex-1 transition-all duration-200 hover:scale-[1.02] disabled:hover:scale-100"
                >
                  {loading ? (
                    <MoreHorizontal className="w-4 h-4 mr-2 animate-pulse" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {loading ? 'Sending...' : 'Send Reply'}
                </Button>
                {newMessage && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNewMessage('')}
                    className="px-3"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Section */}
      {messages.length > 0 && (
        <Collapsible open={historyOpen} onOpenChange={setHistoryOpen} className="space-y-4">
          <CollapsibleTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full hover-scale transition-all duration-300 hover:shadow-md hover:border-primary/30"
              onClick={() => {
                setHistoryOpen(!historyOpen);
                if (!historyOpen) {
                  markMessagesAsRead();
                  setUnreadCount(0);
                }
              }}
            >
              <MessageCircle className="w-4 h-4 mr-2 text-primary" />
              Message History ({messages.length} messages)
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs animate-pulse">
                  {unreadCount} new
                </Badge>
              )}
              {historyOpen ? (
                <ChevronUp className="w-4 h-4 ml-auto transition-transform duration-200" />
              ) : (
                <ChevronDown className="w-4 h-4 ml-auto transition-transform duration-200" />
              )}
            </Button>
          </CollapsibleTrigger>
          
           <CollapsibleContent className="space-y-3 mt-4 animate-accordion-down">
             <div className="max-h-[500px] overflow-y-auto space-y-3 pr-2">
               {displayMessages.map((message, index) => (
                <div
                  key={message.id}
                   className={`group p-4 rounded-xl transition-all duration-300 hover:shadow-sm ${
                     message.is_admin_message
                       ? 'bg-gradient-to-r from-primary/10 to-primary/5 border-l-4 border-primary ml-4 animate-slide-in-right'
                       : 'bg-gradient-to-r from-muted/50 to-muted mr-4 animate-slide-in-left'
                   } ${message.id.startsWith('temp-') ? 'opacity-75 animate-pulse' : 'animate-fade-in'}`}
                   style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                       {message.is_admin_message ? (
                         <Badge variant="default" className="text-xs bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0">
                           <Shield className="w-3 h-3 mr-1" />
                           Admin
                         </Badge>
                       ) : (
                         <Badge variant="outline" className="text-xs border-primary/20">
                           <User className="w-3 h-3 mr-1" />
                           User
                         </Badge>
                       )}
                       {message.id.startsWith('temp-') && (
                         <Badge variant="secondary" className="text-xs ml-1 animate-pulse">
                           <MoreHorizontal className="w-3 h-3 mr-1" />
                           Sending...
                         </Badge>
                       )}
                       {!message.id.startsWith('temp-') && (
                         <Badge variant="outline" className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                           <CheckCircle2 className="w-3 h-3 mr-1 text-green-600" />
                           Delivered
                         </Badge>
                       )}
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      {format(new Date(message.created_at), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                  
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {message.message}
                  </p>
                  
                  {message.file_url && (
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto mt-3 text-primary hover:text-primary/80 transition-colors"
                      onClick={() => window.open(message.file_url, '_blank')}
                    >
                      📎 View Attachment
                    </Button>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
             </div>
           </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}