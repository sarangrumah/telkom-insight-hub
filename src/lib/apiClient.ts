const baseUrl = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:4000';

const TOKEN_KEY = 'app.jwt.token';

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const resp = await fetch(`${baseUrl}/api/auth/refresh`, {
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
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

function buildJsonHeaders(original?: HeadersInit, token?: string | null): Record<string, string> {
  const base: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (original && typeof original === 'object') {
    Object.assign(base, original as Record<string, string>);
  }
  if (token) base['Authorization'] = `Bearer ${token}`;
  return base;
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  let token = localStorage.getItem(TOKEN_KEY);
  const hadToken = Boolean(token);
  let headers = buildJsonHeaders(options.headers, token);

  let resp = await fetch(`${baseUrl}${path}`, { ...options, headers });

  if (resp.status === 401 && hadToken) {
    // try to refresh using httpOnly cookies only if user previously had a token
    const newToken = await refreshAccessToken();
    if (newToken) {
      token = newToken;
      headers = buildJsonHeaders(options.headers, token);
      resp = await fetch(`${baseUrl}${path}`, { ...options, headers });
    }
  }

  if (resp.status === 401) {
    // still unauthorized after optional refresh
    if (hadToken) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event('auth:logout'));
    }
    throw new Error('Unauthorized (401) - Please login again.');
  }

  if (!resp.ok) {
    let message: string;
    try {
      const data: unknown = await resp.json();
      const payload = data as { message?: string; error?: string };
      message = payload.message ?? payload.error ?? 'API error';
    } catch {
      // Handle case where response body is already consumed or not JSON
      try {
        message = await resp.text();
      } catch {
        message = 'API error';
      }
    }
    throw new Error(message || 'API error');
  }

  return resp.json();
}

// Low-level helper for multipart/form-data (no automatic JSON headers)
export async function apiFetchFormData(path: string, formData: FormData) {
  let token = localStorage.getItem(TOKEN_KEY);
  const hadToken = Boolean(token);
  let headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let resp = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (resp.status === 401 && hadToken) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      token = newToken;
      headers = { Authorization: `Bearer ${token}` };
      resp = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers,
        body: formData,
      });
    }
  }

  if (resp.status === 401) {
    if (hadToken) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event('auth:logout'));
    }
    throw new Error('Unauthorized (401) - Please login again.');
  }

  if (!resp.ok) {
    let message: string;
    try {
      const data: unknown = await resp.json();
      const payload = data as { message?: string; error?: string };
      message = payload.message ?? payload.error ?? 'API error';
    } catch {
      // Handle case where response body is already consumed or not JSON
      try {
        message = await resp.text();
      } catch {
        message = 'API error';
      }
    }
    throw new Error(message || 'API error');
  }

  return resp.json();
}

// Tickets specific helpers
export interface TicketUpdatePayload {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  category?: string;
  assigned_to?: string | null;
  assignment_status?: string | null;
}

export interface TicketCreatePayload {
  title: string;
  description: string;
  priority?: string;
  category?: string;
  file_url?: string | null;
}

export interface TicketRecord {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category?: string;
  file_url?: string | null;
  created_at: string;
  updated_at: string;
  user_id?: string | null;
  assigned_to?: string | null;
  assignment_status?: string | null;
}

export const TicketsAPI = {
  list: () => apiFetch('/api/tickets') as Promise<TicketRecord[]>,
  update: (id: string, data: TicketUpdatePayload) =>
    apiFetch(`/api/tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  create: (data: TicketCreatePayload) =>
    apiFetch('/api/tickets', { method: 'POST', body: JSON.stringify(data) }),
};

// Ticket messages helpers
export interface TicketMessageRecord {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_admin_message: boolean;
  file_url?: string | null;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateMessagePayload {
  message: string;
  file_url?: string | null;
}

export const MessagesAPI = {
  list: async (ticketId: string) => {
    const res = await apiFetch(`/api/tickets/${ticketId}/messages`) as { messages?: TicketMessageRecord[] };
    return res.messages ?? [];
  },
  create: async (ticketId: string, payload: CreateMessagePayload) => {
    const res = await apiFetch(`/api/tickets/${ticketId}/messages`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }) as { message: TicketMessageRecord };
    return res.message;
  },
  markRead: async (ticketId: string) => {
    return apiFetch(`/api/tickets/${ticketId}/messages/read`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },
};

// Upload helper (no progress). For progress use XHR directly in components.
export const UploadAPI = {
  uploadPdf: async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return apiFetchFormData('/api/uploads', form) as Promise<{
      file_url: string;
      file_name: string;
      size: number;
    }>;
  },
};

// User profile helpers
export interface UserProfile {
  id: string;
  email: string;
  roles: string[];
  full_name?: string | null;
  company_name?: string | null;
  phone?: string | null;
  is_validated?: boolean;
  maksud_tujuan?: string | null;
}

export interface AdminUser {
  user_id: string;
  full_name: string;
}

export interface AssignmentRecord {
  id: string;
  ticket_id: string;
  assigned_to: string;
  assigned_by: string;
  assigned_at: string;
  unassigned_at: string | null;
  notes: string | null;
  assignee_profile?: { full_name: string };
  assigner_profile?: { full_name: string };
}

export const UserAPI = {
  getProfile: () => apiFetch('/api/user/profile') as Promise<UserProfile>,
  getRoles: () => apiFetch('/api/roles') as Promise<{ roles: string[] }>,
  getAdminUsers: () => apiFetch('/api/admin/users/admins') as Promise<AdminUser[]>,
};

export const AssignmentAPI = {
  getHistory: (ticketId: string) =>
    apiFetch(`/api/tickets/${ticketId}/assignments`) as Promise<AssignmentRecord[]>,
  assign: (ticketId: string, data: { assigned_to: string; notes?: string }) =>
    apiFetch(`/api/tickets/${ticketId}/assign`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  unassign: (ticketId: string) =>
    apiFetch(`/api/tickets/${ticketId}/unassign`, {
      method: 'POST',
    }),
};

// Auth helpers (mirror useAuth operations if needed externally)
export const AuthAPI = {
  login: (email: string, password: string) =>
    apiFetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string, full_name?: string) =>
    apiFetch('/api/auth/register', {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ email, password, full_name }),
    }),
};
