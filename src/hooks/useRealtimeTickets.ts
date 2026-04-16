import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useNotifications } from './useNotifications';
import { useUnreadTicketCount } from './useUnreadTicketCount';
import { wsClient, type WSEvent } from '@/lib/wsClient';

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

  // Set up real-time subscriptions using WebSocket
  useEffect(() => {
    if (!user) return;

    // Subscribe to WebSocket events for realtime updates
    const unsubscribe = wsClient.subscribe((evt: WSEvent) => {
      if (evt.type === 'messageCreated') {
        // Handle new message notifications
        console.log('New message detected via WebSocket:', evt.message);

        // Simple notification - the detailed logic is now handled in individual components
        refreshCounts();
      }

      if (evt.type === 'ticketCreated') {
        // Handle new ticket notifications for admins
        console.log('New ticket detected via WebSocket:', evt.ticket);
        refreshCounts();
      }
    });

    return unsubscribe;
  }, [user, refreshCounts]);


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