import api from './axios.config';
import type { ApiResponse, AssetCategory } from '../types';

export const categoryApi = {
  getAll: () => 
    api.get<ApiResponse<AssetCategory[]>>('/categories'),
  
  getById: (id: number) => 
    api.get<ApiResponse<AssetCategory>>(`/categories/${id}`),
  
  create: (data: Partial<AssetCategory>) => 
    api.post<ApiResponse<AssetCategory>>('/categories', data),
  
  update: (id: number, data: Partial<AssetCategory>) => 
    api.put<ApiResponse<AssetCategory>>(`/categories/${id}`, data),
  
  delete: (id: number) => 
    api.delete<ApiResponse<null>>(`/categories/${id}`),
  
  getActive: () => 
    api.get<ApiResponse<AssetCategory[]>>('/categories/active'),
  
  getSubCategories: (categoryId: number) => 
    api.get<ApiResponse<AssetCategory[]>>(`/categories/${categoryId}/subcategories`),
};
