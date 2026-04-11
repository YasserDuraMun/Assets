import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, LoginRequest, LoginResponse, Permission } from '../types/security';
import { authAPI, permissionsAPI } from '../api/securityApi';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissionsLoading: boolean;
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  logout: () => void;
  hasPermission: (screenName: string, action: 'view' | 'insert' | 'update' | 'delete') => boolean;
  hasRole: (roleName: string) => boolean;
  refreshPermissions: () => Promise<void>;
}

export type { AuthContextType };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
const [user, setUser] = useState<AuthUser | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [permissions, setPermissions] = useState<Permission[]>([]);
const [permissionsLoading, setPermissionsLoading] = useState(false);

useEffect(() => {
  initializeAuth();
}, []);

// Effect ?????? ?? ????? ????????? ??? ????? ????????
/*
useEffect(() => {
  if (user && !permissionsLoading && permissions.length === 0) {
    console.log('?? User changed, reloading permissions...');
    loadUserPermissionsForUser(user);
  }
}, [user, permissions.length, permissionsLoading]);
*/

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('currentUser');
      
      console.log('?? Initializing auth...');
      console.log('?? Token exists:', !!token);
      console.log('?? UserData exists:', !!userData);
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        console.log('?? Restored user from localStorage:', parsedUser);
        setUser(parsedUser);
        
        try {
          console.log('?? Loading permissions during initialization...');
          await loadUserPermissionsForUser(parsedUser);
          console.log('? Permissions loaded during initialization');
        } catch (permError) {
          console.error('? Error loading permissions during init:', permError);
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const testFunction = () => {
    console.log('?? TEST FUNCTION WORKS!');
  };

  const loadUserPermissions = async () => {
    try {
      console.log('?? === Starting loadUserPermissions ===');
      console.log('?? Current user:', user);
      console.log('?? User authenticated:', !!user);
      
      if (!user) {
        console.log('? No user found, cannot load permissions');
        return;
      }
      
      await loadUserPermissionsForUser(user);
    } catch (error) {
      console.error('? Error loading permissions:', error);
      setPermissions([]);
    }
  };

  const loadUserPermissionsForUser = async (currentUser: AuthUser) => {
    try {
      console.log('?? === Starting loadUserPermissionsForUser ===');
      console.log('?? User provided:', currentUser);
      console.log('?? User authenticated:', !!currentUser);
      console.log('?? User roles:', currentUser.roles);
      
      if (!currentUser) {
        console.error('? No currentUser provided to loadUserPermissionsForUser');
        setPermissions([]);
        return;
      }
      
      console.log('?? Calling permissionsAPI.getMyPermissions()...');
      const response = await permissionsAPI.getMyPermissions();
      console.log('??? Permissions API response:', response);
      
      if (!response) {
        console.error('? No response from permissions API');
        setPermissions([]);
        return;
      }
      
      if (!response.success) {
        console.error('? Permissions API returned success=false:', response);
        setPermissions([]);
        return;
      }
      
      if (!response.data) {
        console.error('? Permissions API returned no data:', response);
        setPermissions([]);
        return;
      }
      
      console.log('🚨 CRITICAL FIX: Raw API data:', response.data);
      console.log('🚨 Array type:', Array.isArray(response.data));
      console.log('🚨 Length:', response.data.length);
      console.log('🚨 Dashboard permission:', response.data.find((p: any) => p.screenName === 'Dashboard'));

      // Create fresh array reference to force React state update
      const permissionsArray = response.data.map((p: any) => ({
        screenName: p.screenName,
        allowView: p.allowView,
        allowInsert: p.allowInsert, 
        allowUpdate: p.allowUpdate,
        allowDelete: p.allowDelete
      }));

      console.log('🚨 Created fresh array:', permissionsArray);
      setPermissions(permissionsArray);
      console.log('🚨 setPermissions called - state should update now');

      // Verify after React processes the update
      setTimeout(() => {
        console.log('🚨 VERIFICATION: State should be updated by now');
      }, 100);
      
      // Log each permission for debugging
      response.data.forEach((perm: any, index: number) => {
        console.log(`?? Permission ${index + 1}: ${perm.screenName} - View=${perm.allowView}, Insert=${perm.allowInsert}, Update=${perm.allowUpdate}, Delete=${perm.allowDelete}`);
      });
      
      console.log('? Permissions state updated successfully');
      
    } catch (error) {
      console.error('? Error in loadUserPermissionsForUser:', error);
      if (error instanceof Error) {
        console.error('? Error message:', error.message);
        console.error('? Error stack:', error.stack);
      }
      setPermissions([]);
    }
  };

  const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      console.log('?? Login attempt:', credentials.email);
      const response = await authAPI.login(credentials.email, credentials.password);
      
      if (response.success && response.token) {
        console.log('? Login successful, saving token');
        console.log('?? User roles:', response.roles?.map((r: any) => r.roleName));
        
        // ??? Token
        localStorage.setItem('authToken', response.token);
        console.log('?? Token saved to localStorage');
        
        // ????? AuthUser object
        const authUser: AuthUser = {
          id: response.user.id,
          fullName: response.user.fullName,
          email: response.user.email,
          isActive: response.user.isActive,
          roles: response.roles,
          permissions: []
        };
        
        // ??? ?????? ????????
        localStorage.setItem('currentUser', JSON.stringify(authUser));
        setUser(authUser);
        console.log('?? User set in context:', authUser.fullName);
        
        try {
          // ????? ????????? - ????? user ?????? ????? timing issue
          console.log('?? Loading permissions immediately after login...');
          console.log('?? AuthUser object for permissions:', authUser);
          await loadUserPermissionsForUser(authUser);
          console.log('? Permissions loading completed');
        } catch (permissionError) {
          console.error('? Error loading permissions after login:', permissionError);
        }
        
        return response;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('? Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    setUser(null);
    setPermissions([]);
    // Optionally call logout API
    authAPI.logout().catch(console.error);
  };

  const hasPermission = (screenName: string, action: 'view' | 'insert' | 'update' | 'delete'): boolean => {
    console.log(`?? === hasPermission Check ===`);
    console.log(`?? Checking: ${screenName}.${action}`);
    console.log(`?? User:`, user);
    console.log(`?? Permissions state:`, permissions);
    console.log(`?? Permissions count:`, permissions.length);
    
    if (!user) {
      console.log('? hasPermission: No user logged in');
      return false;
    }
    
    // Super Admin has all permissions
    const isSuperAdmin = user.roles.some(role => role.roleName === 'Super Admin');
    console.log(`?? Is Super Admin:`, isSuperAdmin);
    console.log(`?? User roles:`, user.roles.map(r => r.roleName));
    
    if (isSuperAdmin) {
      console.log('? hasPermission: Super Admin access granted');
      return true;
    }

    // Check specific permissions
    console.log(`?? Looking for permission: ${screenName}`);
    const permission = permissions.find(p => p.screenName === screenName);
    console.log(`?? Found permission:`, permission);
    
    if (!permission) {
      console.log(`? hasPermission: No permission found for screen '${screenName}'`);
      console.log(`? Available screens:`, permissions.map(p => p.screenName));
      return false;
    }

    let hasAccess = false;
    switch (action) {
      case 'view': hasAccess = permission.allowView; break;
      case 'insert': hasAccess = permission.allowInsert; break;
      case 'update': hasAccess = permission.allowUpdate; break;
      case 'delete': hasAccess = permission.allowDelete; break;
      default: hasAccess = false;
    }

    console.log(`?? hasPermission: ${screenName}.${action} = ${hasAccess}`);
    console.log(`?? Permission details:`, {
      allowView: permission.allowView,
      allowInsert: permission.allowInsert, 
      allowUpdate: permission.allowUpdate,
      allowDelete: permission.allowDelete
    });
    
    return hasAccess;
  };

  const hasRole = (roleName: string): boolean => {
    return user?.roles.some(role => role.roleName === roleName) || false;
  };

  const refreshPermissions = async () => {
    if (user) {
      await loadUserPermissionsForUser(user);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    permissionsLoading,
    login,
    logout,
    hasPermission,
    hasRole,
    refreshPermissions
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};