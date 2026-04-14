import axios from 'axios';

// Define Base URL - fallback to localhost if environment variable not set
const API_BASE_URL = (typeof window !== 'undefined' && (window as any).__VITE_API_BASE_URL__) 
  || 'https://localhost:44385/api';

console.log('🌐 API Base URL:', API_BASE_URL);

// Create Axios instance with CORS and credentials configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: false, // Prevent CORS issues
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor ?????? JWT token ? logging
apiClient.interceptors.request.use(
  (config) => {
    console.log('?? API Request:', config.method?.toUpperCase(), config.url || 'unknown');
    console.log('?? Full URL:', (config.baseURL || '') + (config.url || ''));
    
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('? Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor ??????? ?? ???????
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // ????? token ????? ????????
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      // ????? ????? ????? ????? ??????
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/Auth/login', { email, password });
    return response.data;
  },
  logout: async () => {
    const response = await apiClient.post('/Auth/logout');
    return response.data;
  },
};

// Users API calls  
export const usersAPI = {
  getAll: async () => {
    const response = await apiClient.get('/security/users');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await apiClient.get(`/security/users/${id}`);
    return response.data;
  },
  create: async (userData: any) => {
    const response = await apiClient.post('/security/users', userData);
    return response.data;
  },
  update: async (id: number, userData: any) => {
    const response = await apiClient.put(`/security/users/${id}`, userData);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await apiClient.delete(`/security/users/${id}`);
    return response.data;
  },
  toggleStatus: async (id: number) => {
    const response = await apiClient.patch(`/security/users/${id}/status`);
    return response.data;
  },
};

// Roles API calls
export const rolesAPI = {
  getAll: async () => {
    const response = await apiClient.get('/security/roles');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await apiClient.get(`/security/roles/${id}`);
    return response.data;
  },
  create: async (roleData: { roleName: string }) => {
    console.log('🔄 Creating new role:', roleData);
    const response = await apiClient.post('/security/roles', roleData);
    console.log('✅ Role created:', response.data);
    return response.data;
  },
  update: async (id: number, roleData: { roleName?: string; isActive?: boolean }) => {
    console.log('🔄 Updating role:', id, roleData);
    const response = await apiClient.put(`/security/roles/${id}`, roleData);
    console.log('✅ Role updated:', response.data);
    return response.data;
  },
  delete: async (id: number) => {
    console.log('🗑️ Deleting role:', id);
    const response = await apiClient.delete(`/security/roles/${id}`);
    console.log('✅ Role deleted:', response.data);
    return response.data;
  },
  toggleStatus: async (id: number) => {
    console.log('🔄 Toggling role status:', id);
    const response = await apiClient.patch(`/security/roles/${id}/toggle-status`);
    console.log('✅ Role status toggled:', response.data);
    return response.data;
  },
};

// Permissions API calls
export const permissionsAPI = {
  getRoles: async () => {
    const response = await apiClient.get('/security/permissions/roles');
    return response.data;
  },
  getRolePermissions: async (roleId: number) => {
    const response = await apiClient.get(`/security/permissions/roles/${roleId}/permissions`);
    return response.data;
  },
  updateRolePermissions: async (roleId: number, permissions: any[]) => {
    console.log('?? Updating permissions for role:', roleId, 'with data:', permissions);
    
    const response = await apiClient.put(`/security/permissions/roles/${roleId}/permissions`, { 
      permissions: permissions 
    });
    
    console.log('? Update permissions response:', response.data);
    return response.data;
  },
  checkPermission: async (screenName: string, action: string) => {
    const response = await apiClient.get(`/security/permissions/check?screen=${screenName}&action=${action}`);
    return response.data;
  },
  getMyPermissions: async () => {
    console.log('🔍 API: Calling SecurityTest/my-permissions');
    const response = await apiClient.get('SecurityTest/my-permissions');
    console.log('📋 API: Response received:', response.data);
    return response.data;
  },
};

export default apiClient;