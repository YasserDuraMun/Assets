import { createContext, useContext, useState, useEffect, useReducer, ReactNode } from 'react';
import type { FC } from 'react';
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

// Permissions reducer for reliable state management
interface PermissionsState {
  permissions: Permission[];
  isLoaded: boolean;
  lastUpdateTime: number;
}

type PermissionsAction = 
  | { type: 'SET_PERMISSIONS'; payload: Permission[] }
  | { type: 'CLEAR_PERMISSIONS' };

const permissionsReducer = (state: PermissionsState, action: PermissionsAction): PermissionsState => {
  switch (action.type) {
    case 'SET_PERMISSIONS':
      console.log('?? REDUCER: Setting permissions:', action.payload.length);
      return {
        permissions: action.payload,
        isLoaded: true,
        lastUpdateTime: Date.now()
      };
    case 'CLEAR_PERMISSIONS':
      console.log('?? REDUCER: Clearing permissions');
      return {
        permissions: [],
        isLoaded: false,
        lastUpdateTime: 0
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
const [user, setUser] = useState<AuthUser | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [permissionsLoading, setPermissionsLoading] = useState(false);
  
// Use useReducer for more reliable state management
const [permissionsState, dispatchPermissions] = useReducer(permissionsReducer, {
  permissions: [],
  isLoaded: false,
  lastUpdateTime: 0
});
  
const { permissions } = permissionsState;

  // Initialize authentication on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Debug useEffect to monitor permissions state changes
  useEffect(() => {
    console.log('?? PERMISSIONS STATE CHANGED:', permissions.length, 'items');
    console.log('?? Permissions array:', permissions);
    
    if (permissions.length > 0) {
      const dashboardPerm = permissions.find(p => p.screenName === 'Dashboard');
      console.log('?? Dashboard permission in state:', dashboardPerm);
      
      // Verify all permissions in state
      console.log('?? All permissions in state:');
      permissions.forEach((perm, index) => {
        console.log(`  ${index + 1}. ${perm.screenName} - View: ${perm.allowView}`);
      });
      
      console.log('? REACT STATE UPDATE SUCCESSFUL! Permissions are now in state.');
    } else {
      console.log('?? CRITICAL: Permissions state is still EMPTY after setPermissions call!');
      console.log('?? This indicates a fundamental React state update issue.');
    }
  }, [permissions]);

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
      // Check for Super Admin first - they get all permissions automatically
      const isSuperAdmin = currentUser.roles.some(role => role.roleName === 'Super Admin');
      
      if (isSuperAdmin) {
        console.log('?? AuthContext: Super Admin detected - granting all permissions');
        const superAdminPermissions = createAdminPermissions();
        dispatchPermissions({ type: 'SET_PERMISSIONS', payload: superAdminPermissions });
        console.log(`? AuthContext: Super Admin permissions set (${superAdminPermissions.length} screens)`);
        return;
      }

      // For all other users (including Admin), load from API
      console.log('?? AuthContext: Loading permissions from API for non-Super Admin user');
      const response = await permissionsAPI.getMyPermissions();
      
      // Enhanced error handling for API response
      if (!response) {
        console.error('? AuthContext: No response from permissions API');
        dispatchPermissions({ type: 'CLEAR_PERMISSIONS' });
        return;
      }

      // Check if response is HTML (error page) instead of JSON
      if (typeof response === 'string' || !Object.prototype.hasOwnProperty.call(response, 'success')) {
        console.error('? AuthContext: API returned HTML error page instead of JSON:', response);
        console.log('?? AuthContext: This usually means token is expired or API endpoint failed');
        dispatchPermissions({ type: 'CLEAR_PERMISSIONS' });
        return;
      }

      if (!response.success || !Array.isArray(response.data)) {
        console.error('? AuthContext: Invalid API response:', response);
        dispatchPermissions({ type: 'CLEAR_PERMISSIONS' });
        return;
      }

      console.log(`? AuthContext: API returned ${response.data.length} permissions`);
      console.log('?? AuthContext: Raw API data:', response.data);

      // Convert API data to Permission objects with guaranteed types
      const loadedPermissions: Permission[] = response.data.map((perm: any, index: number) => {
        console.log(`?? MAPPING Permission ${index}: ${perm.screenName} - View:${perm.allowView}`);
        return {
          screenName: String(perm.screenName || ''),
          allowView: Boolean(perm.allowView),
          allowInsert: Boolean(perm.allowInsert),
          allowUpdate: Boolean(perm.allowUpdate),
          allowDelete: Boolean(perm.allowDelete)
        };
      });

      console.log('?? Mapped permissions array:', loadedPermissions);
      console.log('?? Dashboard permission check:', loadedPermissions.find(p => p.screenName === 'Dashboard'));

      console.log('?? USING useReducer: Direct dispatch to set permissions');
      
      // Use reducer dispatch - more reliable than useState
      dispatchPermissions({ type: 'SET_PERMISSIONS', payload: loadedPermissions });
      
      console.log('?? dispatchPermissions called - state should be reliable now');

    } catch (error) {
      console.error('? AuthContext: Error loading permissions:', error);
      dispatchPermissions({ type: 'CLEAR_PERMISSIONS' });
    } finally {
      setPermissionsLoading(false);
      console.log('? AuthContext: Permission loading complete');
    }
  };

  const createAdminPermissions = (): Permission[] => {
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
    dispatchPermissions({ type: 'CLEAR_PERMISSIONS' });
    setPermissionsLoading(false);
  };

  const hasPermission = (screenName: string, action: 'view' | 'insert' | 'update' | 'delete'): boolean => {
    console.log(`??? AuthContext: Checking permission ${screenName}.${action}`);
    console.log(`??? AuthContext: User authenticated: ${!!user}`);
    console.log(`??? AuthContext: Permissions loaded: ${permissions.length}`);
    console.log(`??? AuthContext: Permissions loading: ${permissionsLoading}`);
    console.log(`??? AuthContext: PermissionsState:`, permissionsState);
    
    // Must have authenticated user
    if (!user) {
      console.log('? AuthContext: No authenticated user');
      return false;
    }

    // Super Admin gets everything automatically
    const isSuperAdmin = user.roles.some(role => role.roleName === 'Super Admin');
    if (isSuperAdmin) {
      console.log('?? AuthContext: Super Admin access granted automatically');
      return true;
    }

    // Don't check permissions while they're still loading
    if (permissionsLoading) {
      console.log('? AuthContext: Permissions still loading');
      return false;
    }

    // CRITICAL: Check if permissions were recently loaded but hasPermission is called too early
    const timeSinceLoad = Date.now() - permissionsState.lastUpdateTime;
    if (!permissionsState.isLoaded && timeSinceLoad < 1000) {
      console.log('? AuthContext: Permissions recently updated but not yet loaded, waiting...');
      return false;
    }

    // Debug reducer state
    console.log(`?? REDUCER STATE: isLoaded=${permissionsState.isLoaded}, count=${permissions.length}, lastUpdate=${permissionsState.lastUpdateTime}`);
    
    if (permissions.length === 0) {
      console.log(`?? CRITICAL: Permissions array is EMPTY!`);
      console.log(`?? This indicates permissions were not loaded properly via reducer.`);
      return false;
    }

    // Find the specific permission
    console.log(`?? AuthContext: Looking for ${screenName} in ${permissions.length} permissions`);
    
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