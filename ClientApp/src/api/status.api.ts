import api from './axios.config';
import type { ApiResponse, PagedResult, AssetStatus } from '../types';

export const statusApi = {
  getAll: () => 
    api.get<ApiResponse<AssetStatus[]>>('/statuses'),
  
  getById: (id: number) => 
    api.get<ApiResponse<AssetStatus>>(`/statuses/${id}`),
  
  create: (data: Partial<AssetStatus>) => 
    api.post<ApiResponse<AssetStatus>>('/statuses', data),
  
  update: (id: number, data: Partial<AssetStatus>) => 
    api.put<ApiResponse<AssetStatus>>(`/statuses/${id}`, data),
  
  delete: (id: number) => 
    api.delete<ApiResponse<null>>(`/statuses/${id}`),
  
  getActive: () => 
    api.get<ApiResponse<AssetStatus[]>>('/statuses/active'),
};
