import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook to check user permissions for specific screens and actions
 */
export const usePermissions = () => {
  const { user, permissions, hasPermission: authHasPermission, hasRole } = useAuth();

  /**
   * Check if the current user has a specific permission for a screen
   * @param screenName - Name of the screen (e.g., 'Assets', 'Maintenance', 'Reports')
   * @param permission - Type of permission ('view', 'create', 'update', 'delete')
   * @returns boolean - true if user has permission, false otherwise
   */
  const hasPermission = (screenName: string, permission: 'view' | 'create' | 'update' | 'delete'): boolean => {
    // If no user is logged in, return false
    if (!user) {
      console.log('? usePermissions: No user logged in');
      return false;
    }

    // Super Admin has all permissions
    if (hasRole('Super Admin')) {
      console.log('?? usePermissions: Super Admin - all permissions granted');
      return true;
    }

    // Map our permission names to the ones used in AuthContext
    const mappedPermission = permission === 'create' ? 'insert' : permission;
    
    const result = authHasPermission(screenName, mappedPermission as 'view' | 'insert' | 'update' | 'delete');
    
    console.log(`? usePermissions: ${screenName}.${permission} = ${result}`);
    return result;
  };

  /**
   * Get all permissions for a specific screen
   * @param screenName - Name of the screen
   * @returns object with all permission flags
   */
  const getScreenPermissions = (screenName: string) => {
    console.log(`?? usePermissions: Getting permissions for ${screenName} (user: ${user?.fullName})`);
    
    if (hasRole('Super Admin')) {
      console.log('?? usePermissions: Super Admin - granting all permissions');
      return {
        canView: true,
        canCreate: true,
        canUpdate: true,
        canDelete: true,
      };
    }

    const permissionResults = {
      canView: hasPermission(screenName, 'view'),
      canCreate: hasPermission(screenName, 'create'),
      canUpdate: hasPermission(screenName, 'update'),
      canDelete: hasPermission(screenName, 'delete'),
    };

    console.log(`? usePermissions: Final permissions for ${screenName}:`, permissionResults);
    return permissionResults;
  };

  /**
   * Check if user has any permission for a screen (useful for navigation)
   * @param screenName - Name of the screen
   * @returns boolean - true if user has at least one permission
   */
  const hasAnyPermission = (screenName: string): boolean => {
    const screenPermissions = getScreenPermissions(screenName);
    return screenPermissions.canView || screenPermissions.canCreate || screenPermissions.canUpdate || screenPermissions.canDelete;
  };

  return {
    hasPermission,
    getScreenPermissions,
    hasAnyPermission,
    user,
    isSuperAdmin: hasRole('Super Admin'),
    permissions // Expose permissions for debugging
  };
};

export default usePermissions;