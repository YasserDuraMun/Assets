import api from './axios.config';
import type { ApiResponse } from '../types';

export interface DashboardStats {
  totalAssets: number;
  activeAssets: number;
  assetsUnderMaintenance: number;
  disposedAssets: number;
  recentTransfers: number;
  recentDisposals: number;
}

export interface ChartData {
  name: string;
  value: number;
  fill: string;
}

export interface CategoryData {
  categoryDistribution: ChartData[];
  categories: Array<{
    categoryName: string;
    categoryId: number;
    assetsCount: number;
    color: string;
  }>;
}

export interface StatusData {
  statusDistribution: ChartData[];
  statuses: Array<{
    statusName: string;
    statusId: number;
    assetsCount: number;
    color: string;
  }>;
}

export const dashboardApi = {
  // Get main statistics - compatible with DashboardPage
  getStats: () => 
    api.get<ApiResponse<DashboardStats>>('/dashboard/statistics'),
    
  getStatistics: () => 
    api.get<ApiResponse<DashboardStats>>('/dashboard/statistics'),
  
  // Get assets grouped by category for charts
  getAssetsByCategory: () => 
    api.get<ApiResponse<CategoryData>>('/dashboard/assets-by-category'),
  
  // Get assets grouped by status for charts
  getAssetsByStatus: () => 
    api.get<ApiResponse<StatusData>>('/dashboard/assets-by-status'),
  
  // Get recent activities
  getRecentActivities: (limit: number = 10) => 
    api.get<ApiResponse<any[]>>(`/dashboard/recent-activities?limit=${limit}`),
  
  // Get dashboard alerts
  getAlerts: () => 
    api.get<ApiResponse<any[]>>('/dashboard/alerts'),
};