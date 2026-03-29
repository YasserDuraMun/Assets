import api from './axios.config';
import type { ApiResponse } from '../types';

export interface DashboardStats {
  totalAssets: number;
  totalEmployees: number;
  totalDepartments: number;
  totalWarehouses: number;
  activeAssets: number;
  inactiveAssets: number;
  assetsWithWarranty: number;
  expiringWarranties: number;
  disposedAssets: number; // ????? ?????? ???????
}

export interface AssetsByCategory {
  categoryName: string;
  categoryId: number;
  assetsCount: number;
  color?: string;
}

export interface AssetsByStatus {
  statusName: string;
  statusId: number;
  assetsCount: number;
  color?: string;
}

export interface RecentActivity {
  id: number;
  type: 'asset_created' | 'asset_updated' | 'asset_transferred' | 'maintenance_scheduled';
  description: string;
  assetName?: string;
  userName: string;
  createdAt: string;
}

export interface DashboardAlert {
  id: number;
  type: 'warranty_expiring' | 'maintenance_due' | 'no_location';
  title: string;
  description: string;
  assetId?: number;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export const dashboardApi = {
  // Get main statistics
  getStatistics: () => 
    api.get<ApiResponse<DashboardStats>>('/dashboard/statistics'),
  
  // Get assets grouped by category for pie chart
  getAssetsByCategory: () => 
    api.get<ApiResponse<AssetsByCategory[]>>('/dashboard/assets-by-category'),
  
  // Get assets grouped by status for bar chart  
  getAssetsByStatus: () => 
    api.get<ApiResponse<AssetsByStatus[]>>('/dashboard/assets-by-status'),
  
  // Get recent activities
  getRecentActivities: (limit: number = 10) => 
    api.get<ApiResponse<RecentActivity[]>>(`/dashboard/recent-activities?limit=${limit}`),
  
  // Get dashboard alerts
  getAlerts: () => 
    api.get<ApiResponse<DashboardAlert[]>>('/dashboard/alerts'),
};