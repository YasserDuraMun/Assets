import api from './axios.config';
import type { ApiResponse } from '../types';

// Report Types
export interface ReportPeriod {
  startDate?: string;
  endDate?: string;
}

export interface AssetsSummaryReport {
  reportTitle: string;
  generatedAt: string;
  period: ReportPeriod;
  summary: {
    totalAssets: number;
    activeAssets: number;
    disposedAssets: number;
    totalValue: number;
    currency: string;
  };
  assetsByCategory: Array<{ category: string; count: number }>;
  assetsByStatus: Array<{ status: string; count: number }>;
  charts: {
    categoryDistribution: Array<{ label: string; value: number }>;
    statusDistribution: Array<{ label: string; value: number }>;
  };
}

export interface DisposalReport {
  reportTitle: string;
  generatedAt: string;
  period: ReportPeriod;
  summary: {
    totalDisposals: number;
    periodCovered: string;
  };
  disposalsByReason: Array<{ reason: string; reasonText: string; count: number }>;
  disposalsByCategory: Array<{ category: string; count: number }>;
  disposalsByMonth: Array<{ year: number; month: number; count: number }>;
  recentDisposals: Array<{
    id: number;
    assetName: string;
    assetSerialNumber: string;
    category: string;
    disposalDate: string;
    reason: string;
    reasonText: string;
    notes: string;
    performedBy: string;
  }>;
  charts: {
    reasonDistribution: Array<{ label: string; value: number }>;
    categoryDistribution: Array<{ label: string; value: number }>;
    monthlyTrend: Array<{ label: string; value: number }>;
  };
}

export interface MaintenanceReport {
  reportTitle: string;
  generatedAt: string;
  period: ReportPeriod;
  summary: {
    totalMaintenance: number;
    totalCost: number;
    currency: string;
    periodCovered: string;
  };
  maintenanceByType: Array<{ type: string; typeText: string; count: number; totalCost: number }>;
  maintenanceByStatus: Array<{ status: string; statusText: string; count: number }>;
  maintenanceByCategory: Array<{ category: string; count: number; totalCost: number }>;
  upcomingMaintenance: Array<{
    assetName: string;
    assetSerialNumber: string;
    nextMaintenanceDate: string;
    type: string;
    daysUntilDue: number;
  }>;
  charts: {
    typeDistribution: Array<{ label: string; value: number }>;
    statusDistribution: Array<{ label: string; value: number }>;
    monthlyTrend: Array<{ label: string; value: number }>;
    monthlyCostTrend: Array<{ label: string; value: number }>;
  };
}

export interface TransfersReport {
  reportTitle: string;
  generatedAt: string;
  period: ReportPeriod;
  summary: {
    totalTransfers: number;
    periodCovered: string;
  };
  transfersByCategory: Array<{ category: string; count: number }>;
  transfersByMonth: Array<{ year: number; month: number; count: number }>;
  topFromLocations: Array<{ location: string; count: number }>;
  topToLocations: Array<{ location: string; count: number }>;
  recentTransfers: Array<{
    id: number;
    assetName: string;
    assetSerialNumber: string;
    category: string;
    movementDate: string;
    fromLocation: string;
    toLocation: string;
    reason: string;
    performedBy: string;
  }>;
  charts: {
    categoryDistribution: Array<{ label: string; value: number }>;
    monthlyTrend: Array<{ label: string; value: number }>;
    fromLocationDistribution: Array<{ label: string; value: number }>;
    toLocationDistribution: Array<{ label: string; value: number }>;
  };
}

export interface CustomReportRequest {
  startDate?: string;
  endDate?: string;
  categories?: string[];
  statuses?: string[];
  locations?: string[];
  reportTypes: string[]; // "assets", "disposals", "maintenance", "transfers"
  includeCharts?: boolean;
  includeDetails?: boolean;
  reportFormat?: string; // "json", "excel", "pdf"
}

export interface AvailableReports {
  basicReports: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  operationalReports: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  periodicalReports: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}

export const reportsApi = {
  // Test endpoint
  test: () =>
    api.get<ApiResponse<any>>('/reports/test'),

  // Basic Reports
  getAssetsSummary: (startDate?: string, endDate?: string) =>
    api.get<ApiResponse<AssetsSummaryReport>>('/reports/assets-summary', {
      params: { startDate, endDate }
    }),

  getAssetsByStatus: () =>
    api.get<ApiResponse<any>>('/reports/assets-by-status'),

  getAssetsByCategory: () =>
    api.get<ApiResponse<any>>('/reports/assets-by-category'),

  getAssetsByLocation: () =>
    api.get<ApiResponse<any>>('/reports/assets-by-location'),

  // Operational Reports
  getDisposalReport: (params?: {
    startDate?: string;
    endDate?: string;
    disposalReason?: number;
    categoryFilter?: string;
  }) =>
    api.get<ApiResponse<DisposalReport>>('/reports/disposal-report', { params }),

  getMaintenanceReport: (params?: {
    startDate?: string;
    endDate?: string;
    maintenanceType?: number;
    status?: number;
    categoryFilter?: string;
  }) =>
    api.get<ApiResponse<MaintenanceReport>>('/reports/maintenance-report', { params }),

  getTransfersReport: (params?: {
    startDate?: string;
    endDate?: string;
    fromLocation?: string;
    toLocation?: string;
    categoryFilter?: string;
  }) =>
    api.get<ApiResponse<TransfersReport>>('/reports/transfers-report', { params }),

  // Periodical Reports
  getMonthlySummary: (year: number, month: number) =>
    api.get<ApiResponse<any>>('/reports/monthly-summary', { params: { year, month } }),

  // Custom Reports
  generateCustomReport: (request: CustomReportRequest) =>
    api.post<ApiResponse<any>>('/reports/custom-report', request),

  // Metadata
  getAvailableReports: () =>
    api.get<ApiResponse<AvailableReports>>('/reports/available-reports')
};