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
  const { hasPermission, user, permissionsLoading, isLoading } = useAuth();

  console.log(`??? PermissionGuard: Checking ${screenName}.${action} for user ${user?.fullName}`);
  console.log(`??? PermissionGuard: Loading states - auth: ${isLoading}, permissions: ${permissionsLoading}`);
  
  // Show loading state while authentication or permissions are loading
  if (isLoading || permissionsLoading) {
    console.log(`? PermissionGuard: Loading (auth: ${isLoading}, permissions: ${permissionsLoading})`);
    return (
      <div style={{
        minHeight: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#6c757d'
        }}>
          <div style={{
            fontSize: '24px',
            marginBottom: '8px'
          }}>
            ?
          </div>
          <div>Loading permissions...</div>
          <small style={{ color: '#6c757d' }}>
            Checking access for {screenName}.{action}
          </small>
        </div>
      </div>
    );
  }
  
  // Check permission
  const hasAccess = hasPermission(screenName, action);
  console.log(`??? PermissionGuard: Permission result for ${screenName}.${action} = ${hasAccess}`);
  
  if (!hasAccess) {
    console.log(`? PermissionGuard: Access denied for ${screenName}.${action}`);
    
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
            <p style={{margin: '0 0 8px 0'}}>
              You don't have permission to access this section.
            </p>
            <small style={{ 
              color: '#adb5bd', 
              display: 'block',
              backgroundColor: '#e9ecef',
              padding: '4px 8px',
              borderRadius: '4px',
              fontFamily: 'monospace'
            }}>
              Required: {screenName}.{action}
            </small>
            {user && (
              <small style={{ 
                color: '#6c757d', 
                marginTop: '8px',
                display: 'block'
              }}>
                User: {user.email} | Roles: {user.roles.map(r => r.roleName).join(', ')}
              </small>
            )}
          </div>
        </div>
      );
    }
    
    return <>{fallback}</>;
  }

  console.log(`? PermissionGuard: Access granted for ${screenName}.${action}`);
  return <>{children}</>;
};

// Enhanced Role Guard Component
interface RoleGuardProps {
  roles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAll?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  roles,
  children,
  fallback = null,
  requireAll = false
}) => {
  const { hasRole, user, isLoading } = useAuth();

  console.log(`?? RoleGuard: Checking roles [${roles.join(', ')}] (requireAll: ${requireAll})`);

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <span>? Checking roles...</span>
      </div>
    );
  }

  const hasRequiredRoles = requireAll
    ? roles.every(role => hasRole(role))
    : roles.some(role => hasRole(role));

  console.log(`?? RoleGuard: Role check result = ${hasRequiredRoles}`);

  if (!hasRequiredRoles) {
    console.log(`? RoleGuard: Missing required roles. User roles: [${user?.roles.map(r => r.roleName).join(', ') || 'none'}]`);
    return <>{fallback}</>;
  }

  console.log(`? RoleGuard: Role requirements met`);
  return <>{children}</>;
};

// Enhanced Combined Guard
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
  const { hasPermission, hasRole, isLoading, permissionsLoading } = useAuth();

  console.log(`?? CombinedGuard: Checking ${screenName}.${action} with roles [${roles.join(', ')}]`);

  if (isLoading || permissionsLoading) {
    return (
      <div style={{
        minHeight: '150px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <span>? Checking permissions and roles...</span>
      </div>
    );
  }

  const hasScreenPermission = hasPermission(screenName, action);
  const hasRequiredRole = roles.length === 0 || roles.some(role => hasRole(role));

  console.log(`?? CombinedGuard: Permission = ${hasScreenPermission}, Role = ${hasRequiredRole}`);

  if (!hasScreenPermission || !hasRequiredRole) {
    console.log(`? CombinedGuard: Access denied (permission: ${hasScreenPermission}, role: ${hasRequiredRole})`);
    return <>{fallback}</>;
  }

  console.log(`? CombinedGuard: All requirements met`);
  return <>{children}</>;
};

export default PermissionGuard;