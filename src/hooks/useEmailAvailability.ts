import { useState, useEffect, useRef, useCallback } from 'react';

interface EmailAvailabilityState {
  checking: boolean;
  available: boolean | null; // null = belum dicek / invalid format
  error: string | null;
}

interface UseEmailAvailabilityOptions {
  debounceMs?: number;
  auto?: boolean; // jika false hanya cek via trigger manual
}

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function useEmailAvailability(
  email: string,
  options: UseEmailAvailabilityOptions = {}
) {
  const { debounceMs = 500, auto = true } = options;
  const [state, setState] = useState<EmailAvailabilityState>({
    checking: false,
    available: null,
    error: null,
  });
  const abortRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<number | undefined>(undefined);
  const lastQueriedRef = useRef<string>('');
  const rawBackendUrl = (import.meta.env.VITE_API_BASE_URL as string) || '';
  const backendUrl = rawBackendUrl.endsWith('/panel') ? rawBackendUrl.slice(0, -6) : rawBackendUrl;

  const runCheck = useCallback(
    async (value: string) => {
      if (!value || !EMAIL_REGEX.test(value)) {
        setState(prev => ({
          ...prev,
          available: null,
          checking: false,
          error: null,
        }));
        return;
      }
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setState(prev => ({ ...prev, checking: true, error: null }));
      try {
        const resp = await fetch(
          `${backendUrl}/api/auth/check-email?email=${encodeURIComponent(
            value
          )}`,
          { signal: controller.signal }
        );
        if (!resp.ok) {
          setState(prev => ({
            ...prev,
            checking: false,
            error: `Server error (${resp.status})`,
            available: prev.available,
          }));
          return;
        }
        const json = await resp.json();
        setState({ checking: false, available: !!json.available, error: null });
        lastQueriedRef.current = value;
      } catch (e: unknown) {
        if (e instanceof DOMException && e.name === 'AbortError') return; // ignore aborted
        setState(prev => ({
          ...prev,
          checking: false,
          error: 'Network error',
          available: prev.available,
        }));
      }
    },
    [backendUrl]
  );

  useEffect(() => {
    if (!auto) return; // manual mode
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => runCheck(email), debounceMs);
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [email, debounceMs, auto, runCheck]);

  const manualCheck = useCallback(() => runCheck(email), [runCheck, email]);

  return { ...state, checkNow: manualCheck };
}
