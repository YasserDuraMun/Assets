import api from './axios.config';
import type { ApiResponse } from '../types';

export interface CreateTransferData {
  assetId: number;
  transferDate: string;
  fromEmployeeId?: number;
  fromWarehouseId?: number;
  fromDepartmentId?: number;
  fromSectionId?: number;
  toEmployeeId?: number;
  toWarehouseId?: number;
  toDepartmentId?: number;
  toSectionId?: number;
  reason?: string;
  notes?: string;
}

export interface LocationDetails {
  type?: number;
  employeeName?: string;
  warehouseName?: string;
  departmentName?: string;
  sectionName?: string;
}

export interface Transfer {
  id: number;
  assetId: number;
  assetName: string;
  assetSerialNumber: string;
  transferDate: string;
  fromLocation?: string;
  toLocation?: string;
  fromLocationDetails?: LocationDetails;
  toLocationDetails?: LocationDetails;
  reason?: string;
  notes?: string;
  performedBy: string;
  createdAt: string;
}

export const transferApi = {
  // Get all transfers with optional filters
  getAll: (assetId?: number, employeeId?: number) => {
    const params = new URLSearchParams();
    if (assetId) params.append('assetId', assetId.toString());
    if (employeeId) params.append('employeeId', employeeId.toString());
    
    return api.get<ApiResponse<Transfer[]>>(`/transfers?${params.toString()}`);
  },
  
  // Get transfer by ID
  getById: (id: number) => 
    api.get<ApiResponse<Transfer>>(`/transfers/${id}`),
  
  // Create new transfer
  create: (data: CreateTransferData) => 
    api.post<ApiResponse<Transfer>>('/transfers', data),
  
  // Get transfer history for asset
  getAssetHistory: (assetId: number) => 
    api.get<ApiResponse<Transfer[]>>(`/transfers/asset/${assetId}/history`),
  
  // Get transfers for employee
  getByEmployee: (employeeId: number) => 
    api.get<ApiResponse<Transfer[]>>(`/transfers/employee/${employeeId}`),
};