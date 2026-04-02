// Auth types and utilities
export interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string, user: any) => void;
  logout: () => void;
  user: any;
}

export interface User {
  username: string;
  fullName: string;
  role: string;
  expiresAt: string;
}