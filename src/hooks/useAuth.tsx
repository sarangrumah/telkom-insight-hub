import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, !!session);
        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setSessionError(false);
          setLoading(false);
          
          // Handle session expiration or token refresh failures
          if (event === 'SIGNED_OUT' && !session) {
            setSessionError(false); // Clear error on explicit sign out
            setUser(null); // Ensure user is cleared
            // Clear any cached data
            localStorage.removeItem('supabase.auth.token');
          }
          
          if (event === 'TOKEN_REFRESHED' && session) {
            console.log('Token refreshed successfully');
          }
          
          // Handle token refresh failures
          if (event === 'TOKEN_REFRESHED' && !session) {
            console.log('Token refresh failed, clearing session');
            setSessionError(true);
            setUser(null);
          }
        }
      }
    );

    // THEN check for existing session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session error:', error);
          if (isMounted) {
            setSessionError(true);
            setLoading(false);
          }
          return;
        }
        
        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setSessionError(false);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth error:', error);
        if (isMounted) {
          setSessionError(true);
          setLoading(false);
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    loading,
    sessionError,
  };
}