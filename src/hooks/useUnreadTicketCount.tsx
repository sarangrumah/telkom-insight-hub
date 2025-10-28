import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { wsClient, type WSEvent } from '@/lib/wsClient';
import { apiFetch } from '@/lib/apiClient';

interface UnreadCounts {
  userTickets: number;
  adminTickets: number;
  unread: number;
  highPriority: number;
  total: number;
}

export function useUnreadTicketCount() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<UnreadCounts>({
    userTickets: 0,
    adminTickets: 0,
    unread: 0,
    highPriority: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchUnreadCounts = useCallback(async () => {
    try {
      if (!user) return;

      const res = await apiFetch('/api/tickets/stats');
      const next = res?.counts || {};
      setCounts({
        userTickets: Number(next.userTickets || 0),
        adminTickets: Number(next.adminTickets || 0),
        unread: Number(next.unread || 0),
        highPriority: Number(next.highPriority || 0),
        total: Number(next.total || 0),
      });
    } catch (error) {
      console.error('Error fetching unread counts:', error);
      setCounts({
        userTickets: 0,
        adminTickets: 0,
        unread: 0,
        highPriority: 0,
        total: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchUnreadCounts();

    // Subscribe for real-time updates via WebSocket
    const unsubscribe = wsClient.subscribe((evt: WSEvent) => {
      if (
        evt.type === 'messageCreated' ||
        evt.type === 'ticketCreated' ||
        evt.type === 'ticketUpdated' ||
        evt.type === 'ticketClosed'
      ) {
        fetchUnreadCounts();
      }
    });

    return unsubscribe;
  }, [user, fetchUnreadCounts]);

  return { counts, loading, refreshCounts: fetchUnreadCounts };
}