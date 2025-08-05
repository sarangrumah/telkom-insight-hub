import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useNotifications } from './useNotifications';
import { useUnreadTicketCount } from './useUnreadTicketCount';

export function useRealtimeTickets() {
  const { user } = useAuth();
  const { notifyNewMessage, notifyNewTicket, updateTabTitle } = useNotifications();
  const { counts, refreshCounts } = useUnreadTicketCount();
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [lastTicketCount, setLastTicketCount] = useState(0);

  // Track total unread count and update tab title
  useEffect(() => {
    const totalUnread = counts.userTickets + counts.adminTickets;
    updateTabTitle(totalUnread);
  }, [counts, updateTabTitle]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    let messageChannel: any;
    let ticketChannel: any;

    const setupRealtimeSubscriptions = async () => {
      // Get initial counts to compare against
      const initialMessageCount = await getMessageCount();
      const initialTicketCount = await getTicketCount();
      setLastMessageCount(initialMessageCount);
      setLastTicketCount(initialTicketCount);

      // Subscribe to new messages
      messageChannel = supabase
        .channel('ticket-messages-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'ticket_messages'
          },
          async (payload) => {
            console.log('New message detected:', payload);
            
            // Get ticket info for the new message
            const { data: ticketData } = await supabase
              .from('tickets')
              .select('title, user_id')
              .eq('id', payload.new.ticket_id)
              .single();

            if (ticketData) {
              const isUserMessage = !payload.new.is_admin_message;
              const isAdminMessage = payload.new.is_admin_message;
              
              // Check if user should be notified
              const { data: userRole } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id)
                .single();

              const isAdmin = userRole?.role && ['super_admin', 'internal_admin', 'pengolah_data'].includes(userRole.role);
              
              // Notify based on user type and message type
              if (isAdmin && isUserMessage) {
                // Admin receiving user message
                notifyNewMessage(ticketData.title, false, counts.adminTickets + 1);
              } else if (!isAdmin && isAdminMessage && ticketData.user_id === user.id) {
                // User receiving admin response to their ticket
                notifyNewMessage(ticketData.title, true, counts.userTickets + 1);
              }
            }
            
            // Refresh counts
            refreshCounts();
          }
        )
        .subscribe();

      // Subscribe to new tickets (for admins)
      ticketChannel = supabase
        .channel('tickets-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'tickets'
          },
          async (payload) => {
            console.log('New ticket detected:', payload);
            
            // Check if user is admin
            const { data: userRole } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', user.id)
              .single();

            const isAdmin = userRole?.role && ['super_admin', 'internal_admin', 'pengolah_data'].includes(userRole.role);
            
            if (isAdmin) {
              notifyNewTicket(payload.new.title, counts.adminTickets + 1);
            }
            
            // Refresh counts
            refreshCounts();
          }
        )
        .subscribe();
    };

    setupRealtimeSubscriptions();

    return () => {
      if (messageChannel) {
        supabase.removeChannel(messageChannel);
      }
      if (ticketChannel) {
        supabase.removeChannel(ticketChannel);
      }
    };
  }, [user, notifyNewMessage, notifyNewTicket, refreshCounts, counts]);

  const getMessageCount = async (): Promise<number> => {
    try {
      const { count } = await supabase
        .from('ticket_messages')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    } catch (error) {
      console.error('Error getting message count:', error);
      return 0;
    }
  };

  const getTicketCount = async (): Promise<number> => {
    try {
      const { count } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    } catch (error) {
      console.error('Error getting ticket count:', error);
      return 0;
    }
  };

  // Auto-refresh function that can be called manually
  const refreshTicketData = useCallback(() => {
    refreshCounts();
    // Trigger a custom event that components can listen to
    window.dispatchEvent(new CustomEvent('refreshTickets'));
  }, [refreshCounts]);

  return {
    refreshTicketData,
    unreadCounts: counts,
  };
}