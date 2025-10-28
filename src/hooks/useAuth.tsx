import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  ReactNode,
} from 'react';

// Simple backend auth using JWT stored in localStorage.
// Backend endpoints expected: POST /api/auth/login, POST /api/auth/register, returning { token, user }

export interface AppUser {
  id: string;
  email: string;
  roles?: string[];
  full_name?: string;
  is_validated?: boolean;
}

const TOKEN_KEY = 'app.jwt.token';

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  sessionExpired: boolean; // hanya untuk token invalid / expired
  authActionError: string | null; // error dari aksi login/register terakhir
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    full_name?: string,
    company_name?: string,
    phone?: string,
    maksud_tujuan?: string,
    role?: string,
    context?: string
  ) => Promise<void>;
  logout: () => void;
  token: () => string | null;
  refreshProfile: () => Promise<void>;
  clearAuthActionError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Exported hook accessor for AuthContext
export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error(
      'useAuth must be used within an <AuthProvider>. Wrap your app root with <AuthProvider>.'
    );
  }
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const value = useProvideAuth();
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

function useProvideAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [authActionError, setAuthActionError] = useState<string | null>(null);

  const backendUrl =
    (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:4000';

  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      const resp = await fetch(`${backendUrl}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!resp.ok) return null;
      const data = (await resp.json()) as { token?: string };
      if (data?.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        // notify other tabs / listeners
        window.dispatchEvent(new Event('auth:token'));
        return data.token;
      }
      return null;
    } catch {
      return null;
    }
  };

  // Decode base64url safely (JWT payload encoding)
  function base64UrlDecode(input: string): string {
    let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad === 2) base64 += '==';
    else if (pad === 3) base64 += '=';
    else if (pad !== 0) base64 += '===';
    try {
      return atob(base64);
    } catch {
      return '';
    }
  }

  const decodeToken = (
    token: string
  ): { sub: string; email?: string; exp?: number } | null => {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const payloadJson = base64UrlDecode(parts[1]);
      if (!payloadJson) return null;
      const json = JSON.parse(payloadJson);
      return json;
    } catch {
      return null;
    }
  };

  const loadFromStorage = useCallback(async () => {
    let token = localStorage.getItem(TOKEN_KEY);
    const tryDecode = (t: string | null) => (t ? decodeToken(t) : null);
    let decoded = tryDecode(token);

    // Tidak ada token sama sekali => belum login; jangan panggil refresh dan jangan tampilkan sessionExpired
    if (!token) {
      setUser(null);
      setSessionExpired(false);
      setLoading(false);
      return;
    }

    // Token ada tapi format invalid (gagal decode) => anggap logout diam-diam
    if (!decoded) {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      setSessionExpired(false);
      setLoading(false);
      return;
    }

    // Token valid tapi sudah expired => coba refresh via cookie httpOnly
    const isExpired = decoded.exp ? decoded.exp * 1000 < Date.now() : false;
    if (isExpired) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        token = newToken;
        decoded = tryDecode(newToken);
        setSessionExpired(false);
      } else {
        // Refresh gagal -> tandai sessionExpired
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
        setSessionExpired(true);
        setLoading(false);
        return;
      }
    }

    // Ambil profil menggunakan token (mungkin hasil refresh)
    try {
      const resp = await fetch(`${backendUrl}/api/user/profile`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (resp.ok) {
        const data = await resp.json();
        setUser({
          id: decoded?.sub || data.id,
          email: decoded?.email || data.email,
          roles: data.roles,
          full_name: data.full_name,
          is_validated: data.is_validated,
        });
      } else {
        setUser(decoded ? { id: decoded.sub, email: decoded.email || '' } : null);
      }
    } catch {
      setUser(decoded ? { id: decoded.sub, email: decoded.email || '' } : null);
    }
    setLoading(false);
  }, [backendUrl]);

  useEffect(() => {
    loadFromStorage();

    // Sync logout/login across multiple hook consumers (no context approach)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY) {
        loadFromStorage();
      }
    };
    const handleCustomLogout = () => {
      setUser(null);
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('auth:logout', handleCustomLogout as EventListener);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(
        'auth:logout',
        handleCustomLogout as EventListener
      );
    };
  }, [loadFromStorage]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const resp = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      if (!resp.ok) {
        // coba ambil pesan error dari body
        let message = 'Login failed';
        try {
          const errJson = await resp.json();
          if (errJson?.error) message = errJson.error;
        } catch {
          /* ignore */
        }
        throw new Error(message);
      }
      const data = await resp.json();
      localStorage.setItem(TOKEN_KEY, data.token);
      setUser({
        id: data.user.id,
        email: data.user.email,
        roles: data.user.roles,
        full_name: data.user.full_name,
        is_validated: data.user.is_validated,
      });
      // Jika full_name belum tersedia dalam response login (versi lama backend), lakukan fetch profile segera
      if (!data.user.full_name) {
        try {
          const profileResp = await fetch(`${backendUrl}/api/user/profile`, {
            headers: { Authorization: `Bearer ${data.token}` },
          });
          if (profileResp.ok) {
            const profile = await profileResp.json();
            setUser(prev =>
              prev
                ? {
                    ...prev,
                    full_name:
                      profile.full_name || prev.full_name || prev.email,
                    roles: profile.roles || prev.roles,
                  }
                : prev
            );
          }
        } catch (e) {
          // ignore: fallback akan tetap menampilkan email
          console.warn('Failed immediate profile refresh after login', e);
        }
      }
      setSessionExpired(false);
      setAuthActionError(null); // clear previous action error after success
    } catch (e) {
      console.error(e);
      setAuthActionError(e instanceof Error ? e.message : 'Login failed');
      setSessionExpired(false); // ini kegagalan aksi, bukan session expired
      setUser(null);
      // propagate so caller (UI) dapat membedakan sukses/gagal & tidak menampilkan toast sukses
      throw e instanceof Error ? e : new Error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    full_name?: string,
    company_name?: string,
    phone?: string,
    maksud_tujuan?: string,
    role?: string,
    context?: string
  ) => {
    setLoading(true);
    try {
      const resp = await fetch(`${backendUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
          full_name,
          company_name,
          phone,
          maksud_tujuan,
          role,
          context,
        }),
      });

      if (!resp.ok) {
        // Coba ambil body error
        let message = 'Registration failed';
        try {
          const errJson = await resp.json();
          if (errJson?.error) message = errJson.error;
        } catch {
          /* ignore */
        }
        // 409 (conflict) tidak dianggap session expired
        if (resp.status === 409) {
          throw new Error(message || 'Email already registered');
        }
        // Error lain (500 dsb) juga dilempar biasa tanpa menandai session expired
        throw new Error(message);
      }

      const data = await resp.json();
      localStorage.setItem(TOKEN_KEY, data.token);
      setUser({
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.full_name,
        roles: data.user.roles,
        is_validated: data.user.is_validated,
      });
      setSessionExpired(false);
      setAuthActionError(null);
    } catch (e) {
      // Jangan set sessionError untuk kegagalan register normal
      console.error('Register error:', e);
      setUser(null);
      setAuthActionError(
        e instanceof Error ? e.message : 'Registration failed'
      );
      throw e instanceof Error ? e : new Error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Revoke server-side session/refresh (best-effort)
    fetch(`${backendUrl}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    // Notify other tabs / hook instances
    window.dispatchEvent(new Event('auth:logout'));
  };

  const refreshProfile = async () => {
    await loadFromStorage();
  };

  const clearAuthActionError = () => setAuthActionError(null);

  return {
    user,
    loading,
    sessionExpired,
    authActionError,
    login,
    register,
    logout,
    token: () => localStorage.getItem(TOKEN_KEY),
    refreshProfile,
    clearAuthActionError,
  };
}
