import api from './axios.config';
import type { ApiResponse, Asset, PagedResult } from '../types';

export const assetApi = {
  getAll: (params?: { 
    pageNumber?: number; 
    pageSize?: number; 
    search?: string;
    categoryId?: number;
    statusId?: number;
  }) => 
    api.get<ApiResponse<PagedResult<Asset>>>('/assets', { params }),
  
  getById: (id: number, includeDeleted: boolean = false) => 
    api.get<ApiResponse<Asset>>(`/assets/${id}`, { params: { includeDeleted } }),
  
  create: (data: Partial<Asset>) => 
    api.post<ApiResponse<Asset>>('/assets', data),
  
  update: (id: number, data: Partial<Asset>) => 
    api.put<ApiResponse<Asset>>(`/assets/${id}`, data),
  
  delete: (id: number) => 
    api.delete<ApiResponse<null>>(`/assets/${id}`),
  
  getByEmployee: (employeeId: number) => 
    api.get<ApiResponse<Asset[]>>(`/assets/employee/${employeeId}`),
  
  getByWarehouse: (warehouseId: number) => 
    api.get<ApiResponse<Asset[]>>(`/assets/warehouse/${warehouseId}`),
  
  getByDepartment: (departmentId: number) => 
    api.get<ApiResponse<Asset[]>>(`/assets/department/${departmentId}`),
};
