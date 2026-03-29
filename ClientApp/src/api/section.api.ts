import api from './axios.config';
import type { ApiResponse, Section } from '../types';

export const sectionApi = {
  getAll: () => 
    api.get<ApiResponse<Section[]>>('/sections'),
  
  getById: (id: number) => 
    api.get<ApiResponse<Section>>(`/sections/${id}`),
  
  create: (data: Partial<Section>) => 
    api.post<ApiResponse<Section>>('/sections', data),
  
  update: (id: number, data: Partial<Section>) => 
    api.put<ApiResponse<Section>>(`/sections/${id}`, data),
  
  delete: (id: number) => 
    api.delete<ApiResponse<null>>(`/sections/${id}`),
  
  getByDepartment: (departmentId: number) => 
    api.get<ApiResponse<Section[]>>(`/sections/by-department/${departmentId}`),
};
