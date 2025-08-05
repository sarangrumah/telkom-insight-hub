import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface NotificationPreferences {
  browserNotifications: boolean;
  soundNotifications: boolean;
  tabNotifications: boolean;
}

export function useNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    browserNotifications: true,
    soundNotifications: true,
    tabNotifications: true,
  });

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((result) => {
          setPermission(result);
        });
      }
    }
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (!preferences.soundNotifications) return;
    
    try {
      // Create a simple notification sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }, [preferences.soundNotifications]);

  // Show browser notification
  const showBrowserNotification = useCallback((title: string, body: string, icon?: string) => {
    if (!preferences.browserNotifications || permission !== 'granted') return;
    
    try {
      const notification = new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'support-ticket',
        requireInteraction: false,
        silent: false,
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Handle click to focus window
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Error showing browser notification:', error);
    }
  }, [preferences.browserNotifications, permission]);

  // Update document title with unread count
  const updateTabTitle = useCallback((unreadCount: number) => {
    if (!preferences.tabNotifications) return;
    
    const baseTitle = 'Telekom Support System';
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }
  }, [preferences.tabNotifications]);

  // Send notification for new message
  const notifyNewMessage = useCallback((ticketTitle: string, isAdminMessage: boolean, unreadCount: number) => {
    const title = isAdminMessage ? 'New Admin Response' : 'New User Message';
    const body = `New message in ticket: ${ticketTitle}`;
    
    playNotificationSound();
    showBrowserNotification(title, body);
    updateTabTitle(unreadCount);
  }, [playNotificationSound, showBrowserNotification, updateTabTitle]);

  // Send notification for new ticket (admin only)
  const notifyNewTicket = useCallback((ticketTitle: string, unreadCount: number) => {
    const title = 'New Support Ticket';
    const body = `New ticket created: ${ticketTitle}`;
    
    playNotificationSound();
    showBrowserNotification(title, body);
    updateTabTitle(unreadCount);
  }, [playNotificationSound, showBrowserNotification, updateTabTitle]);

  return {
    permission,
    preferences,
    setPreferences,
    notifyNewMessage,
    notifyNewTicket,
    updateTabTitle,
    playNotificationSound,
    showBrowserNotification,
  };
}