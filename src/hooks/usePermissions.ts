import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/lib/apiClient';

export interface Permission {
  module_code: string;
  module_name: string;
  field_code: string;
  field_name: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
  field_access: string;
}

interface ApiPermission {
  module_code: string;
  module_name?: string;
  field_code?: string;
  field_name?: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
  field_access?: string;
}

export interface PermissionState {
  permissions: Permission[];
  loading: boolean;
  error: string | null;
}

export const usePermissions = (moduleCode?: string) => {
  const { user } = useAuth();
  const [state, setState] = useState<PermissionState>({
    permissions: [],
    loading: true,
    error: null,
  });

  const fetchPermissions = useCallback(async () => {
    if (!user?.id) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'User not authenticated',
      }));
      return;
    }
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      // gunakan apiFetch agar header Authorization konsisten (token key: app.jwt.token)
      const json = await apiFetch('/panel/api/permissions/effective');
      let perms: ApiPermission[] = json.permissions || [];
      if (moduleCode) {
        perms = perms.filter(p => p.module_code === moduleCode);
      }
      // Normalize to Permission[] shape
      const normalized: Permission[] = perms.map(p => ({
        module_code: p.module_code,
        module_name: p.module_name || '',
        field_code: p.field_code || '',
        field_name: p.field_name || '',
        can_create: p.can_create,
        can_read: p.can_read,
        can_update: p.can_update,
        can_delete: p.can_delete,
        field_access: p.field_access || 'read_only',
      }));
      setState({ permissions: normalized, loading: false, error: null });
    } catch (e) {
      console.error('Error fetching permissions:', e);
      setState(prev => ({
        ...prev,
        loading: false,
        error: e instanceof Error ? e.message : 'Failed to fetch permissions',
      }));
    }
  }, [user?.id, moduleCode]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // Helper functions for easy permission checking
  const checkPermission = useCallback(
    (
      moduleCode: string,
      action: 'create' | 'read' | 'update' | 'delete',
      fieldCode?: string
    ): boolean => {
      const modulePermissions = state.permissions.filter(
        p => p.module_code === moduleCode
      );

      if (modulePermissions.length === 0) return false;

      // If checking field-level permission
      if (fieldCode) {
        const fieldPermission = modulePermissions.find(
          p => p.field_code === fieldCode
        );
        if (fieldPermission) {
          return fieldPermission[`can_${action}`] || false;
        }
      }

      // Check module-level permission
      const modulePermission = modulePermissions.find(
        p => !p.field_code || p.field_code === ''
      );
      if (modulePermission) {
        return modulePermission[`can_${action}`] || false;
      }

      return false;
    },
    [state.permissions]
  );

  const canCreate = useCallback(
    (moduleCode: string, fieldCode?: string) =>
      checkPermission(moduleCode, 'create', fieldCode),
    [checkPermission]
  );

  const canRead = useCallback(
    (moduleCode: string, fieldCode?: string) =>
      checkPermission(moduleCode, 'read', fieldCode),
    [checkPermission]
  );

  const canUpdate = useCallback(
    (moduleCode: string, fieldCode?: string) =>
      checkPermission(moduleCode, 'update', fieldCode),
    [checkPermission]
  );

  const canDelete = useCallback(
    (moduleCode: string, fieldCode?: string) =>
      checkPermission(moduleCode, 'delete', fieldCode),
    [checkPermission]
  );

  const getFieldAccess = useCallback(
    (moduleCode: string, fieldCode: string): string => {
      const fieldPermission = state.permissions.find(
        p => p.module_code === moduleCode && p.field_code === fieldCode
      );
      return fieldPermission?.field_access || 'read_only';
    },
    [state.permissions]
  );

  const canAccessModule = useCallback(
    (moduleCode: string): boolean => {
      return state.permissions.some(
        p => p.module_code === moduleCode && p.can_read
      );
    },
    [state.permissions]
  );

  return {
    ...state,
    refetch: fetchPermissions,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    getFieldAccess,
    canAccessModule,
    checkPermission,
  };
};
