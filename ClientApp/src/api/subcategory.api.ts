import api from './axios.config';
import type { ApiResponse } from '../types';

export interface SubCategory {
  id: number;
  name: string;
  code: string;
  description?: string;
  categoryId: number;
  categoryName?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateSubCategoryDto {
  name: string;
  code: string;
  description?: string;
  categoryId: number;
}

export interface UpdateSubCategoryDto {
  id: number;
  name: string;
  code: string;
  description?: string;
  categoryId: number;
  isActive: boolean;
}

export const subCategoryApi = {
  // Get all subcategories of a category
  getByCategoryId: (categoryId: number) =>
    api.get<ApiResponse<SubCategory[]>>(`/categories/${categoryId}/subcategories`),

  // Get all subcategories
  getAll: async () => {
    try {
      const response = await api.get<ApiResponse<SubCategory[]>>('/categories/1/subcategories');
      return response;
    } catch {
      return { data: { success: true, message: '', data: [] } } as any;
    }
  },

  // Create new subcategory
  create: (data: CreateSubCategoryDto) => {
    console.log('Creating subcategory with data:', data);
    return api.post<ApiResponse<SubCategory>>('/categories/subcategories', data);
  },

  // Update subcategory
  update: (id: number, data: UpdateSubCategoryDto) =>
    api.put<ApiResponse<SubCategory>>(`/categories/subcategories/${id}`, data),

  // Delete subcategory
  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/categories/subcategories/${id}`),
};

// ---- Asset Names ----

export interface AssetName {
  id: number;
  name: string;
  code: string;
  description?: string;
  subCategoryId: number;
  subCategoryName: string;
  categoryName: string;
  isActive: boolean;
  assetsCount: number;
  createdAt: string;
}

export interface CreateAssetNameDto {
  name: string;
  description?: string;
  subCategoryId: number;
}

export interface UpdateAssetNameDto {
  id: number;
  name: string;
  description?: string;
  subCategoryId: number;
  isActive: boolean;
}

export const assetNameApi = {
  getBySubCategoryId: (subCategoryId: number) =>
    api.get<ApiResponse<AssetName[]>>(`/categories/subcategories/${subCategoryId}/assetnames`),

  create: (data: CreateAssetNameDto) =>
    api.post<ApiResponse<AssetName>>('/categories/assetnames', data),

  update: (id: number, data: UpdateAssetNameDto) =>
    api.put<ApiResponse<AssetName>>(`/categories/assetnames/${id}`, data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/categories/assetnames/${id}`),
};
