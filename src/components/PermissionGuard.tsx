import React from "react";
import { usePermissions } from "@/hooks/usePermissions";

interface PermissionGuardProps {
  children: React.ReactNode;
  moduleCode: string;
  action?: 'create' | 'read' | 'update' | 'delete';
  fieldCode?: string;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  moduleCode,
  action = 'read',
  fieldCode,
  fallback = null,
  showFallback = false,
}) => {
  const { checkPermission, loading } = usePermissions(moduleCode);

  if (loading) {
    return showFallback ? fallback : null;
  }

  const hasPermission = checkPermission(moduleCode, action, fieldCode);

  if (!hasPermission) {
    return showFallback ? fallback : null;
  }

  return <>{children}</>;
};

interface ConditionalFieldProps {
  children: React.ReactNode;
  moduleCode: string;
  fieldCode: string;
  fallback?: React.ReactNode;
}

export const ConditionalField: React.FC<ConditionalFieldProps> = ({
  children,
  moduleCode,
  fieldCode,
  fallback = null,
}) => {
  const { getFieldAccess, loading } = usePermissions(moduleCode);

  if (loading) {
    return fallback;
  }

  const fieldAccess = getFieldAccess(moduleCode, fieldCode);

  if (fieldAccess === 'hidden') {
    return fallback;
  }

  return <>{children}</>;
};