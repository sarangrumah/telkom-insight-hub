import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PermissionGuard } from '@/components/PermissionGuard';
import * as usePermissionsHook from '@/hooks/usePermissions';

describe('PermissionGuard', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when permission granted', () => {
    vi.spyOn(usePermissionsHook, 'usePermissions').mockReturnValue({
      permissions: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
      canCreate: vi.fn(),
      canRead: vi.fn(),
      canUpdate: vi.fn(),
      canDelete: vi.fn(),
      getFieldAccess: vi.fn(),
      canAccessModule: vi.fn(),
      checkPermission: () => true,
    } as unknown as ReturnType<typeof usePermissionsHook.usePermissions>);

    render(
      <PermissionGuard moduleCode="user_management" action="read">
        <div data-testid="protected">Allowed</div>
      </PermissionGuard>
    );

    expect(screen.getByTestId('protected')).toBeInTheDocument();
  });

  it('hides children when permission denied', () => {
    vi.spyOn(usePermissionsHook, 'usePermissions').mockReturnValue({
      permissions: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
      canCreate: vi.fn(),
      canRead: vi.fn(),
      canUpdate: vi.fn(),
      canDelete: vi.fn(),
      getFieldAccess: vi.fn(),
      canAccessModule: vi.fn(),
      checkPermission: () => false,
    } as unknown as ReturnType<typeof usePermissionsHook.usePermissions>);

    render(
      <PermissionGuard moduleCode="user_management" action="read">
        <div data-testid="protected">Denied</div>
      </PermissionGuard>
    );

    expect(screen.queryByTestId('protected')).toBeNull();
  });
});
