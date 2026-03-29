import api from './axios.config';
import type { ApiResponse, Warehouse } from '../types';

export const warehouseApi = {
  getAll: () => 
    api.get<ApiResponse<Warehouse[]>>('/warehouses'),
  
  getById: (id: number) => 
    api.get<ApiResponse<Warehouse>>(`/warehouses/${id}`),
  
  create: (data: Partial<Warehouse>) => 
    api.post<ApiResponse<Warehouse>>('/warehouses', data),
  
  update: (id: number, data: Partial<Warehouse>) => 
    api.put<ApiResponse<Warehouse>>(`/warehouses/${id}`, data),
  
  delete: (id: number) => 
    api.delete<ApiResponse<null>>(`/warehouses/${id}`),
  
  getActive: () => 
    api.get<ApiResponse<Warehouse[]>>('/warehouses/active'),
};
