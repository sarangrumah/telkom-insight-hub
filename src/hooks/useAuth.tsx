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

    // Check for existing session immediately
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

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setSessionError(false);
          setLoading(false);
          
          // Handle session expiration
          if (event === 'SIGNED_OUT' && !session) {
            setSessionError(false); // Clear error on explicit sign out
          }
        }
      }
    );

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