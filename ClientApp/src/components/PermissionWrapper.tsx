import React from 'react';
import usePermissions from '../hooks/usePermissions';

interface PermissionWrapperProps {
  children: React.ReactNode;
  screenName: string;
  permission: 'view' | 'create' | 'update' | 'delete';
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders children based on user permissions
 * @param children - Elements to render if permission is granted
 * @param screenName - Screen name to check permission for
 * @param permission - Type of permission to check
 * @param fallback - Optional element to render if permission is denied
 */
export const PermissionWrapper: React.FC<PermissionWrapperProps> = ({
  children,
  screenName,
  permission,
  fallback = null
}) => {
  const { hasPermission } = usePermissions();

  if (hasPermission(screenName, permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export default PermissionWrapper;