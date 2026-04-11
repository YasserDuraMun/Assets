import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, LoginRequest, LoginResponse, Permission } from '../types/security';
import { authAPI, permissionsAPI } from '../api/securityApi';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissionsLoading: boolean;
  permissions: Permission[];
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  logout: () => void;
  hasPermission: (screenName: string, action: 'view' | 'insert' | 'update' | 'delete') => boolean;
  hasRole: (roleName: string) => boolean;
  refreshPermissions: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);

  // Initialize authentication on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    console.log('?? AuthContext: Initializing authentication...');
    
    try {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('currentUser');
      
      if (token && userData) {
        console.log('? AuthContext: Found stored credentials');
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Load permissions after setting user
        console.log('?? AuthContext: Loading stored user permissions...');
        await loadPermissionsForUser(parsedUser);
      } else {
        console.log('?? AuthContext: No stored credentials found');
      }
    } catch (error) {
      console.error('? AuthContext: Error during initialization:', error);
      clearAuthData();
    } finally {
      setIsLoading(false);
      console.log('? AuthContext: Initialization complete');
    }
  };

  const loadPermissionsForUser = async (currentUser: AuthUser) => {
    if (!currentUser) {
      console.log('?? AuthContext: No user provided for permission loading');
      return;
    }

    if (permissionsLoading) {
      console.log('?? AuthContext: Permissions already loading, skipping...');
      return;
    }

    setPermissionsLoading(true);
    console.log(`?? AuthContext: Loading permissions for user ${currentUser.email} (ID: ${currentUser.id})`);
    
    try {
      // Check if user is Super Admin - they get all permissions automatically
      const isSuperAdmin = currentUser.roles.some(role => role.roleName === 'Super Admin');
      
      if (isSuperAdmin) {
        console.log('?? AuthContext: User is Super Admin - granting all permissions');
        const superAdminPermissions = createSuperAdminPermissions();
        setPermissions(superAdminPermissions);
        console.log(`? AuthContext: Super Admin permissions set (${superAdminPermissions.length} screens)`);
        return;
      }

      // For regular users, load from API
      console.log('?? AuthContext: Regular user - loading permissions from API');
      const response = await permissionsAPI.getMyPermissions();
      
      if (!response || !response.success || !Array.isArray(response.data)) {
        console.error('? AuthContext: Invalid API response:', response);
        setPermissions([]);
        return;
      }

      console.log(`? AuthContext: API returned ${response.data.length} permissions`);
      console.log('?? AuthContext: Raw API data:', response.data);

      // Convert API data to Permission objects with guaranteed types
      const loadedPermissions: Permission[] = response.data.map((perm: any) => ({
        screenName: String(perm.screenName || ''),
        allowView: Boolean(perm.allowView),
        allowInsert: Boolean(perm.allowInsert),
        allowUpdate: Boolean(perm.allowUpdate),
        allowDelete: Boolean(perm.allowDelete)
      }));

      // Validate we have the expected permissions
      const dashboardPermission = loadedPermissions.find(p => p.screenName === 'Dashboard');
      if (dashboardPermission) {
        console.log('? AuthContext: Dashboard permission found:', dashboardPermission);
      } else {
        console.log('?? AuthContext: No Dashboard permission found in loaded data');
      }

      // Set permissions
      setPermissions(loadedPermissions);
      console.log(`? AuthContext: Permissions loaded successfully (${loadedPermissions.length} total)`);
      
      // Log each permission for debugging
      loadedPermissions.forEach((perm, index) => {
        console.log(`?? AuthContext: Permission ${index + 1}: ${perm.screenName} - View:${perm.allowView}, Insert:${perm.allowInsert}, Update:${perm.allowUpdate}, Delete:${perm.allowDelete}`);
      });

    } catch (error) {
      console.error('? AuthContext: Error loading permissions:', error);
      setPermissions([]);
    } finally {
      setPermissionsLoading(false);
      console.log('? AuthContext: Permission loading complete');
    }
  };

  const createSuperAdminPermissions = (): Permission[] => {
    const allScreens = [
      'Dashboard', 'Assets', 'Categories', 'Departments', 'Employees',
      'Warehouses', 'Transfers', 'Disposal', 'Maintenance', 'Reports',
      'Users', 'Permissions', 'Settings'
    ];

    return allScreens.map(screenName => ({
      screenName,
      allowView: true,
      allowInsert: true,
      allowUpdate: true,
      allowDelete: true
    }));
  };

  const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    console.log(`?? AuthContext: Attempting login for ${credentials.email}`);
    
    try {
      const response = await authAPI.login(credentials.email, credentials.password);
      
      if (!response.success || !response.token) {
        throw new Error(response.message || 'Login failed');
      }

      console.log('? AuthContext: Login successful');
      
      // Create user object
      const authUser: AuthUser = {
        id: response.user.id,
        fullName: response.user.fullName,
        email: response.user.email,
        isActive: response.user.isActive,
        roles: response.roles || [],
        permissions: [] // Will be loaded separately
      };

      console.log(`?? AuthContext: User object created - ${authUser.fullName} with ${authUser.roles.length} roles`);
      
      // Store authentication data
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('currentUser', JSON.stringify(authUser));
      
      // Set user state
      setUser(authUser);
      
      // Load permissions immediately after login
      console.log('?? AuthContext: Loading permissions after successful login...');
      await loadPermissionsForUser(authUser);
      
      console.log('? AuthContext: Login process complete');
      return response;
      
    } catch (error: any) {
      console.error('? AuthContext: Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('?? AuthContext: Logging out...');
    clearAuthData();
    authAPI.logout().catch(error => 
      console.error('?? AuthContext: Logout API error:', error)
    );
    console.log('? AuthContext: Logout complete');
  };

  const clearAuthData = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    setUser(null);
    setPermissions([]);
    setPermissionsLoading(false);
  };

  const hasPermission = (screenName: string, action: 'view' | 'insert' | 'update' | 'delete'): boolean => {
    console.log(`??? AuthContext: Checking permission ${screenName}.${action}`);
    console.log(`??? AuthContext: User authenticated: ${!!user}`);
    console.log(`??? AuthContext: Permissions loaded: ${permissions.length}`);
    console.log(`??? AuthContext: Permissions loading: ${permissionsLoading}`);
    
    // Must have authenticated user
    if (!user) {
      console.log('? AuthContext: No authenticated user');
      return false;
    }

    // Don't check permissions while they're still loading
    if (permissionsLoading) {
      console.log('? AuthContext: Permissions still loading');
      return false;
    }

    // Super Admin gets everything
    const isSuperAdmin = user.roles.some(role => role.roleName === 'Super Admin');
    if (isSuperAdmin) {
      console.log('?? AuthContext: Super Admin access granted');
      return true;
    }

    // Find the specific permission
    console.log(`?? AuthContext: Looking for ${screenName} in ${permissions.length} permissions`);
    
    // Debug: Log all available screens
    const availableScreens = permissions.map(p => p.screenName);
    console.log(`?? AuthContext: Available screens: [${availableScreens.join(', ')}]`);

    const permission = permissions.find(p => p.screenName === screenName);
    
    if (!permission) {
      console.log(`? AuthContext: No permission found for screen '${screenName}'`);
      return false;
    }

    console.log(`? AuthContext: Found permission for ${screenName}:`, permission);

    // Check the specific action
    let hasAccess = false;
    switch (action) {
      case 'view': hasAccess = permission.allowView; break;
      case 'insert': hasAccess = permission.allowInsert; break;
      case 'update': hasAccess = permission.allowUpdate; break;
      case 'delete': hasAccess = permission.allowDelete; break;
      default: hasAccess = false;
    }

    console.log(`${hasAccess ? '?' : '?'} AuthContext: ${screenName}.${action} = ${hasAccess}`);
    return hasAccess;
  };

  const hasRole = (roleName: string): boolean => {
    const result = user?.roles.some(role => role.roleName === roleName) || false;
    console.log(`?? AuthContext: hasRole('${roleName}') = ${result}`);
    return result;
  };

  const refreshPermissions = async () => {
    console.log('?? AuthContext: Refreshing permissions...');
    if (user) {
      await loadPermissionsForUser(user);
    }
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    permissionsLoading,
    permissions, // Expose permissions for debugging
    login,
    logout,
    hasPermission,
    hasRole,
    refreshPermissions
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };
export type { AuthContextType };