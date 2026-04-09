import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface PermissionGuardProps {
  screenName: string;
  action: 'view' | 'insert' | 'update' | 'delete';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  screenName,
  action,
  children,
  fallback = null
}) => {
  const { hasPermission } = useAuth();

  if (!hasPermission(screenName, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Role Guard Component
interface RoleGuardProps {
  roles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAll?: boolean; // true = requires all roles, false = requires at least one role
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  roles,
  children,
  fallback = null,
  requireAll = false
}) => {
  const { hasRole } = useAuth();

  const hasRequiredRoles = requireAll
    ? roles.every(role => hasRole(role))
    : roles.some(role => hasRole(role));

  if (!hasRequiredRoles) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Combined Guard (Permission AND Role)
interface CombinedGuardProps {
  screenName: string;
  action: 'view' | 'insert' | 'update' | 'delete';
  roles?: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const CombinedGuard: React.FC<CombinedGuardProps> = ({
  screenName,
  action,
  roles = [],
  children,
  fallback = null
}) => {
  const { hasPermission, hasRole } = useAuth();

  const hasScreenPermission = hasPermission(screenName, action);
  const hasRequiredRole = roles.length === 0 || roles.some(role => hasRole(role));

  if (!hasScreenPermission || !hasRequiredRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGuard;