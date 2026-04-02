import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthContextType } from '../types/auth.types';

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  user: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [user, setUser] = useState(null);

console.log('🔄 AuthProvider rendered. Current state:', { isAuthenticated, user });

useEffect(() => {
  const initializeAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
      
    console.log('🔍 AuthContext useEffect - Token exists:', !!token);
    console.log('🔍 AuthContext useEffect - UserData:', userData);
      
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('✅ Parsed User Data:', parsedUser);
        console.log('👤 User FullName:', parsedUser.fullName);
          
        // Check if user data is valid
        if (parsedUser && (parsedUser.fullName || parsedUser.username)) {
          // Use functional updates to avoid ESLint warnings
          setIsAuthenticated(true);
          setUser(parsedUser);
          console.log('✅ User authenticated successfully');
        } else {
          // Invalid user data, need to login again
          console.warn('⚠️ Invalid user data, clearing...');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (e) {
        console.error('❌ Error parsing user data:', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      console.log('ℹ️ No token or user data found');
    }
  };

  initializeAuth();
}, []);

  const login = (token: string, userData: any) => {
    console.log('🔐 AuthContext login called with:', userData);
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
    
    console.log('✅ User data stored and set:', userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};