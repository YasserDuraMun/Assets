import api from './axios.config';
import type { ApiResponse, PagedResult } from '../types';

// Maintenance Types
export interface MaintenanceType {
  value: number;
  label: string;
}

export interface MaintenanceStatus {
  value: number;
  label: string;
  color: string;
}

export interface AssetMaintenance {
  id: number;
  assetId: number;
  assetName: string;
  assetSerialNumber: string;
  maintenanceType: number;
  maintenanceTypeText: string;
  maintenanceDate: string;
  description: string;
  cost?: number;
  currency: string;
  performedBy?: string;
  technicianName?: string;
  companyName?: string;
  status: number;
  statusText: string;
  statusColor?: string;
  scheduledDate?: string;
  completedDate?: string;
  nextMaintenanceDate?: string;
  warrantyUsed: boolean;
  notes?: string;
  createdBy: number;
  createdByName: string;
  createdAt: string;
  isOverdue?: boolean;
  isUpcoming?: boolean;
}

export interface CreateMaintenanceData {
  assetId: number;
  maintenanceType: number;
  maintenanceDate: string;
  description: string;
  cost?: number;
  currency?: string;
  performedBy?: string;
  technicianName?: string;
  companyName?: string;
  scheduledDate?: string;
  nextMaintenanceDate?: string;
  warrantyUsed?: boolean;
  notes?: string;
}

export interface UpdateMaintenanceData extends CreateMaintenanceData {
  id: number;
  status: number;
  completedDate?: string;
}

export interface CompleteMaintenanceData {
  id: number;
  completedDate: string;
  actualCost?: number;
  nextMaintenanceDate?: string;
  completionNotes?: string;
}

export interface MaintenanceStats {
  totalMaintenanceRecords: number;
  pendingMaintenance: number;
  overdueMaintenance: number;
  completedThisMonth: number;
  totalCostThisMonth: number;
  totalCostThisYear: number;
  currency: string;
  preventiveMaintenanceCount: number;
  correctiveMaintenanceCount: number;
  emergencyMaintenanceCount: number;
}

export interface SchedulePreventiveMaintenanceData {
  assetId: number;
  scheduledDate: string;
  description: string;
  intervalMonths: number;
}

export const maintenanceApi = {
  // Get all maintenance records with filtering
  getAll: (params?: {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    assetId?: number;
    maintenanceType?: number;
    status?: number;
    startDate?: string;
    endDate?: string;
  }) => 
    api.get<ApiResponse<PagedResult<AssetMaintenance>>>('/maintenance', { params }),

  // Get maintenance record by ID
  getById: (id: number) =>
    api.get<ApiResponse<AssetMaintenance>>(`/maintenance/${id}`),

  // Get maintenance records for specific asset
  getByAssetId: (assetId: number) =>
    api.get<ApiResponse<AssetMaintenance[]>>(`/maintenance/asset/${assetId}`),

  // Create new maintenance record
  create: (data: CreateMaintenanceData) =>
    api.post<ApiResponse<AssetMaintenance>>('/maintenance', data),

  // Update existing maintenance record
  update: (id: number, data: UpdateMaintenanceData) =>
    api.put<ApiResponse<AssetMaintenance>>(`/maintenance/${id}`, data),

  // Complete maintenance
  complete: (id: number, data: CompleteMaintenanceData) =>
    api.post<ApiResponse<AssetMaintenance>>(`/maintenance/${id}/complete`, data),

  // Cancel maintenance
  cancel: (id: number, reason?: string) =>
    api.post<ApiResponse<null>>(`/maintenance/${id}/cancel`, { reason }),

  // Delete maintenance record (Admin only)
  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/maintenance/${id}`),

  // Get upcoming maintenance (due soon)
  getUpcoming: (days: number = 30) =>
    api.get<ApiResponse<AssetMaintenance[]>>('/maintenance/upcoming', { params: { days } }),

  // Get overdue maintenance
  getOverdue: () =>
    api.get<ApiResponse<AssetMaintenance[]>>('/maintenance/overdue'),

  // Get maintenance statistics
  getStats: () =>
    api.get<ApiResponse<MaintenanceStats>>('/maintenance/stats'),

  // Get asset-specific maintenance stats
  getAssetStats: (assetId: number) =>
    api.get<ApiResponse<any>>(`/maintenance/stats/asset/${assetId}`),

  // Schedule preventive maintenance
  schedulePreventive: (data: SchedulePreventiveMaintenanceData) =>
    api.post<ApiResponse<AssetMaintenance>>('/maintenance/schedule-preventive', data),

  // Get monthly report
  getMonthlyReport: (year: number, month: number) =>
    api.get<ApiResponse<any>>('/maintenance/report/monthly', { params: { year, month } }),

  // Get maintenance types
  getMaintenanceTypes: () =>
    api.get<ApiResponse<MaintenanceType[]>>('/maintenance/types'),

  // Get maintenance statuses
  getMaintenanceStatuses: () =>
    api.get<ApiResponse<MaintenanceStatus[]>>('/maintenance/statuses'),

  // Test endpoint
  test: () =>
    api.get<ApiResponse<any>>('/maintenance/test')
};