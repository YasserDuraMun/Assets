import { ApiResponse, PagedResult, AssetDisposal, CreateDisposalData, DisposalReason, DisposalMethod } from '../types';
import api from './axios.config';

export interface GetDisposalsParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  disposalReason?: number;
  startDate?: string;
  endDate?: string;
}

export const disposalApi = {
  // Get all disposals with pagination and filters
  getAll: (params: GetDisposalsParams = {}) => 
    api.get<ApiResponse<PagedResult<AssetDisposal>>>('/disposals', { params }),

  // Get disposal by ID
  getById: (id: number) => 
    api.get<ApiResponse<AssetDisposal>>(`/disposals/${id}`),

  // Create new disposal
  create: (data: CreateDisposalData) =>
    api.post<ApiResponse<AssetDisposal>>('/disposals', data),

  // Get disposal reasons enum
  getDisposalReasons: () => 
    api.get<ApiResponse<DisposalReason[]>>('/disposals/reasons'),

  // Get disposed assets count (for dashboard)
  getDisposedAssetsCount: () =>
    api.get<ApiResponse<number>>('/disposals/count')
};