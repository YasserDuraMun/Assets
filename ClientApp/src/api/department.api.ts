import api from './axios.config';
import type { ApiResponse, Department } from '../types';

export const departmentApi = {
  getAll: () => 
    api.get<ApiResponse<Department[]>>('/departments'),
  
  getById: (id: number) => 
    api.get<ApiResponse<Department>>(`/departments/${id}`),
  
  create: (data: Partial<Department>) => 
    api.post<ApiResponse<Department>>('/departments', data),
  
  update: (id: number, data: Partial<Department>) => 
    api.put<ApiResponse<Department>>(`/departments/${id}`, data),
  
  delete: (id: number) => 
    api.delete<ApiResponse<null>>(`/departments/${id}`),
  
  getActive: () => 
    api.get<ApiResponse<Department[]>>('/departments/active'),
};
