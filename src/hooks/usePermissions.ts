import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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
      setState(prev => ({ ...prev, loading: false, error: "User not authenticated" }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.rpc('get_user_permissions', {
        _user_id: user.id,
        _module_code: moduleCode || null
      });

      if (error) throw error;

      setState({
        permissions: data || [],
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch permissions',
      }));
    }
  }, [user?.id, moduleCode]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // Helper functions for easy permission checking
  const checkPermission = useCallback((
    moduleCode: string,
    action: 'create' | 'read' | 'update' | 'delete',
    fieldCode?: string
  ): boolean => {
    const modulePermissions = state.permissions.filter(p => p.module_code === moduleCode);
    
    if (modulePermissions.length === 0) return false;

    // If checking field-level permission
    if (fieldCode) {
      const fieldPermission = modulePermissions.find(p => p.field_code === fieldCode);
      if (fieldPermission) {
        return fieldPermission[`can_${action}`] || false;
      }
    }

    // Check module-level permission
    const modulePermission = modulePermissions.find(p => !p.field_code || p.field_code === '');
    if (modulePermission) {
      return modulePermission[`can_${action}`] || false;
    }

    return false;
  }, [state.permissions]);

  const canCreate = useCallback((moduleCode: string, fieldCode?: string) =>
    checkPermission(moduleCode, 'create', fieldCode), [checkPermission]);

  const canRead = useCallback((moduleCode: string, fieldCode?: string) =>
    checkPermission(moduleCode, 'read', fieldCode), [checkPermission]);

  const canUpdate = useCallback((moduleCode: string, fieldCode?: string) =>
    checkPermission(moduleCode, 'update', fieldCode), [checkPermission]);

  const canDelete = useCallback((moduleCode: string, fieldCode?: string) =>
    checkPermission(moduleCode, 'delete', fieldCode), [checkPermission]);

  const getFieldAccess = useCallback((moduleCode: string, fieldCode: string): string => {
    const fieldPermission = state.permissions.find(
      p => p.module_code === moduleCode && p.field_code === fieldCode
    );
    return fieldPermission?.field_access || 'read_only';
  }, [state.permissions]);

  const canAccessModule = useCallback((moduleCode: string): boolean => {
    return state.permissions.some(p => p.module_code === moduleCode && p.can_read);
  }, [state.permissions]);

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