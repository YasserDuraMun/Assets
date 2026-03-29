import api from './axios.config';
import type { ApiResponse, Employee, PagedResult } from '../types';

export const employeeApi = {
  getAll: (params?: { pageNumber?: number; pageSize?: number; search?: string }) => 
    api.get<ApiResponse<PagedResult<Employee>>>('/employees', { params }),
  
  getById: (id: number) => 
    api.get<ApiResponse<Employee>>(`/employees/${id}`),
  
  create: (data: Partial<Employee>) => 
    api.post<ApiResponse<Employee>>('/employees', data),
  
  update: (id: number, data: Partial<Employee>) => 
    api.put<ApiResponse<Employee>>(`/employees/${id}`, data),
  
  delete: (id: number) => 
    api.delete<ApiResponse<null>>(`/employees/${id}`),
  
  getActive: () => 
    api.get<ApiResponse<Employee[]>>('/employees/active'),
  
  getByDepartment: (departmentId: number) => 
    api.get<ApiResponse<Employee[]>>(`/employees/department/${departmentId}`),
};
