import React from 'react';
import { useAuth } from '../hooks/useAuth';

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
  const { hasPermission, user } = useAuth();

  console.log(`??? PermissionGuard: Checking ${screenName}.${action} for user ${user?.fullName}`);
  
  const hasAccess = hasPermission(screenName, action);
  
  if (!hasAccess) {
    console.log(`? PermissionGuard: Access denied for ${screenName}.${action}`);
    
    // ??? ?? ???? fallback? ???? ????? ?????
    if (!fallback) {
      return (
        <div style={{
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <div style={{
            textAlign: 'center',
            color: '#6c757d'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}>
              ??
            </div>
            <h3 style={{
              margin: '0 0 8px 0',
              color: '#495057'
            }}>
              Access Denied
            </h3>
            <p style={{margin: '0'}}>
              You don't have permission to access this section.
            </p>
            <small style={{ color: '#adb5bd', marginTop: '8px', display: 'block' }}>
              Required: {screenName}.{action}
            </small>
          </div>
        </div>
      );
    }
    
    return <>{fallback}</>;
  }

  console.log(`? PermissionGuard: Access granted for ${screenName}.${action}`);
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