export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface Asset {
  id: number;
  name: string;
  description?: string;
  serialNumber: string;
  barcode?: string;
  qrCode?: string;
  categoryId: number;
  categoryName?: string;
  subCategoryId?: number;
  subCategoryName?: string;
  statusId: number;
  statusName?: string;
  statusColor?: string;
  currentLocationType: number | 'Employee' | 'Warehouse' | 'Department' | 'Section'; // Support both
  currentEmployeeId?: number;
  currentEmployeeName?: string;
  currentWarehouseId?: number;
  currentWarehouseName?: string;
  currentDepartmentId?: number;
  currentDepartmentName?: string;
  currentSectionId?: number;
  currentSectionName?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  hasWarranty: boolean;
  warrantyExpiryDate?: string;
  createdAt: string;
  updatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface AssetStatus {
  id: number;
  name: string;
  code: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AssetCategory {
  id: number;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  parentCategoryId?: number;
  parentCategoryName?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Section {
  id: number;
  name: string;
  code: string;
  description?: string;
  departmentId: number;
  departmentName?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Warehouse {
  id: number;
  name: string;
  code: string;
  location?: string;
  capacity?: number;
  responsibleEmployeeId?: number;
  responsibleEmployeeName?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Employee {
  id: number;
  fullName: string;
  employeeNumber: string;
  email?: string;
  phoneNumber?: string;
  nationalId?: string;
  jobTitle?: string;
  departmentId: number;
  departmentName?: string;
  sectionId?: number;
  sectionName?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AssetDisposal {
  id: number;
  assetId: number;
  assetName: string;
  assetSerialNumber: string;
  disposalDate: string;
  disposalReason: string; // Backend ?????? ?? string (enum name)
  notes?: string;
  performedBy: string;
  createdAt: string;
}

export interface CreateDisposalData {
  assetId: number;
  disposalDate: string;
  disposalReason: number;
  notes?: string;
}

export interface DisposalReason {
  value: number;
  label: string;
}

export interface DisposalMethod {
  value: number;
  label: string;
}

