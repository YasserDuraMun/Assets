import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, LoginRequest, LoginResponse, Permission } from '../types/security';
import { authAPI, permissionsAPI } from '../api/securityApi';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
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

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('currentUser');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        await loadUserPermissions();
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserPermissions = async () => {
    try {
      const response = await permissionsAPI.getMyPermissions();
      if (response.success && response.data) {
        setPermissions(response.data);
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
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
        
        // ????? ?????????
        await loadUserPermissions();
        
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
    if (!user) return false;
    
    // Super Admin has all permissions
    if (user.roles.some(role => role.roleName === 'Super Admin')) {
      return true;
    }

    const permission = permissions.find(p => p.screenName === screenName);
    if (!permission) return false;

    switch (action) {
      case 'view': return permission.allowView;
      case 'insert': return permission.allowInsert;
      case 'update': return permission.allowUpdate;
      case 'delete': return permission.allowDelete;
      default: return false;
    }
  };

  const hasRole = (roleName: string): boolean => {
    return user?.roles.some(role => role.roleName === roleName) || false;
  };

  const refreshPermissions = async () => {
    if (user) {
      await loadUserPermissions();
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};