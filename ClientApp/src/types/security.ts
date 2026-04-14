// User Types
export interface User {
  id: number;
  fullName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  roles: Role[];
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  password: string;
  isActive: boolean;
  roleIds: number[];
}

export interface UpdateUserRequest {
  fullName: string;
  email: string;
  isActive: boolean;
  password?: string;
  roleIds: number[];
}

// Role Types
export interface Role {
  roleId: number;
  roleName: string;
  isActive: boolean;
  createdAt?: string;
  userCount?: number;
}

export interface CreateRoleRequest {
  roleName: string;
}

export interface UpdateRoleRequest {
  roleName?: string;
  isActive?: boolean;
}

export interface RolePermission {
  roleId: number;
  roleName: string;
  permissions: Permission[];
}

// Permission Types
export interface Permission {
  screenName: string;
  allowView: boolean;
  allowInsert: boolean;
  allowUpdate: boolean;
  allowDelete: boolean;
}

export interface Screen {
  screenID: number;
  screenName: string;
  sType: string;
  hint: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
  roles: Role[];
}

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  isActive: boolean;
  roles: Role[];
  permissions: Permission[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}