import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import Dashboard from '../Dashboard';
import { useUnreadTicketCount } from '@/hooks/useUnreadTicketCount';
import { useRealtimeTickets } from '@/hooks/useRealtimeTickets';

// Mock hooks
vi.mock('@/hooks/useUnreadTicketCount');
vi.mock('@/hooks/useRealtimeTickets');
vi.mock('@/hooks/use-toast');

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  },
}));

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  role: 'authenticated',
};

const mockSession = {
  access_token: 'test-token',
  refresh_token: 'test-refresh',
  expires_in: 3600,
  token_type: 'bearer',
  user: mockUser,
};

describe('Dashboard', () => {
  beforeEach(() => {
    vi.mocked(useUnreadTicketCount).mockReturnValue({
      counts: { userTickets: 0, adminTickets: 0, unread: 0, highPriority: 0, total: 0 },
      loading: false,
      refreshCounts: vi.fn(),
    });
    
    vi.mocked(useRealtimeTickets).mockReturnValue(undefined);
  });

  it('renders dashboard with user data', async () => {
    render(
      <Dashboard 
        user={mockUser} 
        session={mockSession} 
        onLogout={vi.fn()} 
      />
    );

    expect(document.body).toContain('Dashboard');
  });

  it('shows loading state initially', () => {
    render(
      <Dashboard 
        user={mockUser} 
        session={mockSession} 
        onLogout={vi.fn()} 
      />
    );

    expect(document.body).toContain('Loading dashboard...');
  });

  it('displays stats cards', async () => {
    render(
      <Dashboard 
        user={mockUser} 
        session={mockSession} 
        onLogout={vi.fn()} 
      />
    );

    expect(document.body).toContain('Total Records');
  });
});