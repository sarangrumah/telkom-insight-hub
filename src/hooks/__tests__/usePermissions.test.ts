import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { usePermissions } from '@/hooks/usePermissions';

// Mock fetch & useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}));

describe('usePermissions', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('fetches and normalizes permissions', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        permissions: [
          {
            module_code: 'user_management',
            module_name: 'User Mgmt',
            can_create: true,
            can_read: true,
            can_update: false,
            can_delete: false,
          },
          {
            module_code: 'user_management',
            field_code: 'full_name',
            can_create: false,
            can_read: true,
            can_update: true,
            can_delete: false,
            field_access: 'editable',
          },
        ],
      }),
    });

    const { result } = renderHook(() => usePermissions('user_management'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.permissions.length).toBe(2);
    expect(result.current.canRead('user_management')).toBe(true);
  });

  it('handles fetch failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false });
    const { result } = renderHook(() => usePermissions('user_management'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeTruthy();
  });
});
