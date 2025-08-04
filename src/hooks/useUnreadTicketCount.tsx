import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UnreadCounts {
  userTickets: number;
  adminTickets: number;
}

export function useUnreadTicketCount() {
  const [counts, setCounts] = useState<UnreadCounts>({
    userTickets: 0,
    adminTickets: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnreadCounts();
    setupRealtimeSubscription();
  }, []);

  const fetchUnreadCounts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      const userRole = roleData?.role;
      const isAdmin = userRole === 'super_admin' || userRole === 'internal_admin' || userRole === 'pengolah_data';

      // Count unread messages for user's tickets (admin responses not read by user)
      const { data: userUnread } = await supabase
        .from('ticket_messages')
        .select('id, ticket_id, tickets!inner(user_id)')
        .eq('is_admin_message', true)
        .eq('is_read', false)
        .eq('tickets.user_id', user.id);

      // Count unread messages for admin (user messages not read by admin)
      let adminUnread = [];
      if (isAdmin) {
        const { data } = await supabase
          .from('ticket_messages')
          .select('id')
          .eq('is_admin_message', false)
          .eq('is_read', false);
        adminUnread = data || [];
      }

      setCounts({
        userTickets: userUnread?.length || 0,
        adminTickets: adminUnread.length
      });
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('unread-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ticket_messages'
        },
        () => {
          // Refetch counts when messages change
          fetchUnreadCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return { counts, loading, refreshCounts: fetchUnreadCounts };
}